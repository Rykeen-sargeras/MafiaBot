# Safetybot v2

This version includes:

- Discord verification panel
- Verify Membership / Check Status / Recheck Membership buttons
- Password-protected `/admin`
- Creator connection only inside admin
- Connected creator management
- Membership level -> Discord role mapping
- Grace period per creator
- Force Sync
- Automatic audits
- Post the verification panel from the admin dashboard
- `/verify` and `/setup-verification` Discord slash commands

## Railway variable to add

ADMIN_PASSWORD=Rykeen123

Keep all your existing Railway variables too.

## Admin page

https://verification-bot-production-942f.up.railway.app/admin

## Test health

https://verification-bot-production-942f.up.railway.app/health

## Important Discord setup

Enable Server Members Intent.

Bot needs Manage Roles.

The bot's role must be ABOVE every membership role.

## Google redirect URI

https://verification-bot-production-942f.up.railway.app/auth/google/callback

## Discord redirect URI

https://verification-bot-production-942f.up.railway.app/auth/discord/callback


## Creator invite links

Use `/admin` → **Creator Invites** → **Create Invite Link**. Send the single-use link to a creator. They connect Google/YouTube without admin access.

Default verification channel ID: `1535094192244523128`.

## NotifyMe live streams

The main website imports live and scheduled YouTube stream notifications from
the NotifyMe Discord channel. The default channel is `1532513768855175279` and
can be overridden with `NOTIFYME_CHANNEL_ID`. Set `NOTIFYME_BOT_ID` when the
NotifyMe application ID is available to lock intake to that specific bot.

Enable **Message Content Intent** for MafiaBot in the Discord Developer Portal.
The bot also needs View Channel and Read Message History permissions in the
NotifyMe channel. On startup it backfills the latest 100 messages, then watches
new notifications in real time. Ordinary video-upload notifications are ignored.


## Creator Connect v2.2

Public creator page:

https://verification-bot-production-942f.up.railway.app/creator-connect

Password:

Rykeen123

Creators click Creator Connect, enter the password, then authorize the Google account that owns their YouTube channel.
