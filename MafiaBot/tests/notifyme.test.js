import assert from 'node:assert/strict';
import test from 'node:test';

Object.assign(process.env, {
  APP_BASE_URL: 'http://localhost:3000',
  SESSION_SECRET: 'test-session',
  DISCORD_BOT_TOKEN: 'test-token',
  DISCORD_CLIENT_ID: 'test-client',
  DISCORD_CLIENT_SECRET: 'test-secret',
  DISCORD_GUILD_ID: 'test-guild',
  GOOGLE_CLIENT_ID: 'test-google-client',
  GOOGLE_CLIENT_SECRET: 'test-google-secret',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
  NOTIFYME_CHANNEL_ID: '1532513768855175279',
});

const { parseNotifyMeMessage } = await import('../src/notifyme.js');

test('parses a NotifyMe live-stream embed and Watch Stream button', () => {
  const createdAt = new Date('2026-08-08T23:01:00Z');
  const stream = parseNotifyMeMessage({
    id: 'message-1',
    channelId: '1532513768855175279',
    author: { id: 'notifyme', username: 'NotifyMe', bot: true },
    content: '@everyone\nLil Compton is live!',
    createdAt,
    embeds: [{
      title: 'This Was a TERRIBLE Idea... | Sons of the Forest LIVE',
      author: { name: 'Lil Compton' },
      image: { url: 'https://i.ytimg.com/vi/AbCdEf12345/maxresdefault.jpg' },
    }],
    components: [{ components: [{ url: 'https://www.youtube.com/watch?v=AbCdEf12345' }] }],
  });

  assert.equal(stream.videoId, 'AbCdEf12345');
  assert.equal(stream.status, 'live');
  assert.equal(stream.creatorName, 'Lil Compton');
  assert.equal(stream.title, 'This Was a TERRIBLE Idea... | Sons of the Forest LIVE');
  assert.equal(stream.thumbnailUrl, 'https://i.ytimg.com/vi/AbCdEf12345/maxresdefault.jpg');
  assert.equal(stream.url, 'https://www.youtube.com/watch?v=AbCdEf12345');
  assert.equal(stream.detectedAt.toISOString(), createdAt.toISOString());
});

test('ignores ordinary NotifyMe upload notifications', () => {
  const stream = parseNotifyMeMessage({
    id: 'message-2',
    channelId: '1532513768855175279',
    author: { id: 'notifyme', username: 'NotifyMe', bot: true },
    content: '@everyone\nKate The Angelic Assassin just posted a new video!',
    embeds: [{ title: 'Urgent Message', url: 'https://youtu.be/ZyXwVu98765' }],
    components: [],
  });

  assert.equal(stream, null);
});
