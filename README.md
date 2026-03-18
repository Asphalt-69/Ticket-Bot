# Premium Discord Ticket Bot (Built by asphalt._,6)

A production-ready ticket system with Discord bot + web dashboard.

## Features
- Panel-based ticket creation
- Support for merged panel groups
- Claim system for staff
- Ticket close + transcript generation (HTML)
- Real-time dashboard sync
- Ticket logs + analytics

## Quick Start
1. Copy `.env.example` to `.env` and fill in your values.
2. Run `npm install` and `cd client && npm install`.
3. Start MongoDB.
4. In development, run `npm run dev` in root and in another terminal `cd client && npm run dev`.
5. For production build: `npm run build` then `npm start`.
6. Open: `http://localhost:3000/dashboard`

## Docker
1. Ensure `.env` has valid values.
2. Run `docker compose up --build`.
3. Visit `http://localhost:3000`.

## Environment Variables (.env)
```txt
DISCORD_TOKEN=YOUR_DISCORD_TOKEN
MONGODB_URI=mongodb://localhost:27017/ticketbot
PORT=3000
BOT_PREFIX=$
ADMIN_ROLE_ID=YOUR_ADMIN_ROLE_ID
DASHBOARD_SECRET=some-secret
GUILD_ID=YOUR_GUILD_ID
TICKET_LOG_CHANNEL_ID=OPTIONAL_LOG_CHANNEL_ID
```

## Discord Commands
- `$help` - Show help and menu.
- `$create <panel-name> <categoryId> <role1,role2> [button|dropdown]` - Create a panel.
- `$merge <group-name> <panelId1> <panelId2> ...` - Merge panels.
- `$publish <panelId> [individual|merged] [button|dropdown] [title] [description] [color]` - Publish panel message.
- `$tickets` - List open tickets.
- `$rename #channel new-name` - Rename ticket channel.

## Dashboard
Create and manage panels, view open tickets, transcripts, and logs.

## API Endpoints
- `GET /api/panels`
- `POST /api/panels`
- `PUT /api/panels/:id`
- `DELETE /api/panels/:id`
- `GET /api/tickets`
- `GET /api/logs`

## Deployment
Use `pm2` or Docker for production. Make sure Discord bot token and MongoDB are set in env.

## License
MIT

