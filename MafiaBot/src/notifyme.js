import { config } from './config.js';
import { db } from './db.js';

function collectComponentUrls(components = [], urls = []) {
  for (const component of components || []) {
    if (component?.url) urls.push(component.url);
    if (component?.components) collectComponentUrls(component.components, urls);
  }
  return urls;
}

function youtubeVideoId(value = '') {
  const candidates = String(value).match(/https?:\/\/[^\s)>\]]+/gi) || [];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate.replace(/[.,!?]+$/, ''));
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
      if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
        const queryId = url.searchParams.get('v');
        if (queryId) return queryId;
        const parts = url.pathname.split('/').filter(Boolean);
        if (['live', 'embed', 'shorts'].includes(parts[0])) return parts[1] || '';
      }
    } catch {}
  }
  return '';
}

function cleanCreatorName(content = '') {
  return String(content)
    .replace(/<@!?&?\d+>/g, '')
    .replace(/@everyone|@here/gi, '')
    .replace(/\b(?:is|went) live!?[\s\S]*$/i, '')
    .replace(/\b(?:scheduled|premiered?)[\s\S]*$/i, '')
    .trim();
}

export function parseNotifyMeMessage(message) {
  if (String(message?.channelId || '') !== config.discord.notifyMeChannelId) return null;
  if (!message?.author?.bot) return null;
  if (config.discord.notifyMeBotId && String(message.author.id) !== config.discord.notifyMeBotId) return null;
  if (!config.discord.notifyMeBotId && !/notifyme/i.test(String(message.author.username || ''))) return null;

  const embeds = [...(message.embeds || [])];
  const signal = [
    message.content,
    ...embeds.flatMap(embed => [embed.title, embed.description, embed.author?.name]),
  ].filter(Boolean).join('\n');
  const isLive = /\b(?:is|went) live\b/i.test(signal);
  const isUpcoming = /\b(?:scheduled|premiere|premiering)\b/i.test(signal);
  if (!isLive && !isUpcoming) return null;

  const urls = [
    message.content,
    ...embeds.flatMap(embed => [embed.url, embed.description]),
    ...collectComponentUrls(message.components),
  ].filter(Boolean);
  let videoId = '';
  let sourceUrl = '';
  for (const value of urls) {
    videoId = youtubeVideoId(value);
    if (videoId) {
      sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
      break;
    }
  }
  if (!videoId) return null;

  const primaryEmbed = embeds.find(embed => youtubeVideoId(embed.url || '')) || embeds[0];
  const creatorName = primaryEmbed?.author?.name || cleanCreatorName(message.content) || 'Misfit Mafia Creator';
  const title = primaryEmbed?.title || `${creatorName} is live`;
  const thumbnailUrl = primaryEmbed?.image?.url || primaryEmbed?.thumbnail?.url || '';
  const detectedAt = message.createdAt instanceof Date ? message.createdAt : new Date(message.createdTimestamp || Date.now());
  const lifetimeHours = isLive ? 18 : 24 * 14;

  return {
    videoId,
    messageId: String(message.id),
    url: sourceUrl,
    creatorName,
    title,
    thumbnailUrl,
    status: isLive ? 'live' : 'upcoming',
    detectedAt,
    expiresAt: new Date(detectedAt.getTime() + lifetimeHours * 60 * 60 * 1000),
  };
}

export async function ingestNotifyMeMessage(message) {
  const stream = parseNotifyMeMessage(message);
  if (!stream) return false;

  await db.query(`
    INSERT INTO site_streams (
      youtube_video_id, discord_message_id, youtube_url, creator_name,
      title, thumbnail_url, status, detected_at, expires_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
    ON CONFLICT (youtube_video_id) DO UPDATE SET
      discord_message_id=EXCLUDED.discord_message_id,
      youtube_url=EXCLUDED.youtube_url,
      creator_name=EXCLUDED.creator_name,
      title=EXCLUDED.title,
      thumbnail_url=EXCLUDED.thumbnail_url,
      status=EXCLUDED.status,
      detected_at=EXCLUDED.detected_at,
      expires_at=EXCLUDED.expires_at,
      updated_at=NOW()
  `, [
    stream.videoId,
    stream.messageId,
    stream.url,
    stream.creatorName,
    stream.title,
    stream.thumbnailUrl || null,
    stream.status,
    stream.detectedAt,
    stream.expiresAt,
  ]);

  console.log(`NotifyMe ${stream.status} stream saved: ${stream.creatorName} / ${stream.videoId}`);
  return true;
}

export async function backfillNotifyMeChannel(client) {
  const channel = await client.channels.fetch(config.discord.notifyMeChannelId);
  if (!channel?.isTextBased()) throw new Error('NotifyMe channel is not text-based or is unavailable.');
  const messages = await channel.messages.fetch({ limit: 100 });
  const ordered = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  let imported = 0;
  for (const message of ordered) {
    if (await ingestNotifyMeMessage(message)) imported += 1;
  }
  console.log(`NotifyMe backfill complete: ${imported} live or scheduled stream notification(s) processed.`);
}
