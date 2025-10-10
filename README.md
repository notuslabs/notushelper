# 🤖 NotusHelper

A Discord bot built with TypeScript and DiscordX that helps manage code reviews, time tracking, and team productivity for software development teams.

## ✨ Features

### 📝 Code Review Management

- **Automated Reviewer Assignment**: Posts with GitHub links in the review channel create a thread and assign reviewers
- **Team-aware selection**: Prioritizes the author's team(s); falls back to outside teams if needed
- **Fair round-robin**: Chooses reviewers with the lowest reviewCount
- **Mentions respected**: Mentioned users are used; remaining slots are auto-filled
- **Review Leaderboard**: Track and display code review statistics

### ⏱️ Time Tracking

- **Start/Stop tracking**: Simple commands to track work hours (optional on-call flag)
- **Daily & Monthly Statistics**: View your work statistics

### 🎯 Team Features

- Team support with developer roles (FRONTEND/BACKEND)
- Developer management with team assignments
- Configurable review-assignment logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18.16.0
- npm 9.5.1 or pnpm 9.12.2+
- PostgreSQL database
- Discord Bot Token
- CODE_REVIEW_CHANNEL_ID (Discord channel ID for review auto-assignment)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd notushelper
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up your environment variables by creating a `.env` file:

```env
BOT_TOKEN=your_discord_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/notushelper
CODE_REVIEW_CHANNEL_ID=your_code_review_channel_id
```

4. Set up the database:

```bash
npx prisma migrate deploy
```

5. Create your seed file:

```bash
# Copy the example seed template
cp src/seed.example.ts src/seed.ts

# Edit src/seed.ts with your team's information
# Add your developers, teams, and team assignments
```

6. Seed the database:

```bash
npm run build
npx prisma db seed
```

### Development

Run the bot in development mode with auto-reload:

```bash
npm run dev
```

### Production

Build and run the bot:

```bash
npm run build
npm start
```

## 🐋 Docker

Start the application with Docker Compose:

```bash
docker-compose up -d
```

View logs:

```bash
docker-compose logs -f
```

Stop the application:

```bash
docker-compose down
```

## 📋 Available Commands

### Code Review Commands

- `/review-leaderboard` - Show review rankings
- Automatic: post a GitHub link in the review channel to trigger reviewer assignment

### Time Tracking Commands

- `/start-time-tracking [on-call]` - Start tracking time
- `/stop-time-tracking` - Stop tracking time
- `/dailystats-work` - View daily work statistics
- `/monthlystats-work [month] [year]` - View monthly work statistics

### Setup Commands

- `/setup init` - Initialize your profile (salario_hora, carga_horaria_dia)
- `/setup update` - Update your profile (salario_hora, carga_horaria_dia)

### Help

- `/help` - Display all available commands

## 🔧 Configuration

### Setting Up Teams

1. Edit your `src/seed.ts` file (this file is gitignored for security)
2. Add your teams to the `teams` array and connect developers by `discordUserId`:

```typescript
const teams: Prisma.TeamUpsertArgs[] = [
  {
    where: { name: "Team A" },
    create: {
      name: "Team A",
      developers: {
        connect: [{ discordUserId: "123" }, { discordUserId: "456" }],
      },
    },
    update: {},
  },
];
```

### Setting Up Developers

Add your developers to the `developers` array:

```typescript
const developers: Prisma.DeveloperUpsertArgs[] = [
  {
    where: { discordUserId: "discord_user_id" },
    create: {
      name: "Developer Name",
      discordUserId: "discord_user_id",
      role: ["FRONTEND"], // ["FRONTEND"], ["BACKEND"], or both
    },
    update: {},
  },
];
```

### Assigning Developers to Teams

Use the `developers.connect` relation on a team to link developers by `discordUserId` (as shown above). You can also connect on updates:

```typescript
await prisma.team.update({
  where: { name: "Team A" },
  data: { developers: { connect: [{ discordUserId: "discord_user_id" }] } },
});
```

## 🎯 How Code Review Assignment Works

1. Post a GitHub link in the configured review channel (`CODE_REVIEW_CHANNEL_ID`): a thread is created and reviewers are selected.
2. Mentions are respected: if none are mentioned, 2 reviewers are auto-picked; if one is mentioned, 1 more is auto-picked.
3. Selection prioritizes the author's team(s) by lowest `reviewCount`, then fills from outside teams, then anyone if needed. Assigned reviewers have their `reviewCount` incremented.

## 🗂️ Database Schema

The bot uses PostgreSQL with Prisma ORM. Main entities:

- **Employee**: id, name, salaryPerHour, discordUserId (unique), workloadPerDay
- **Developer**: id, name, discordUserId (unique), reviewCount, role (FRONTEND/BACKEND), teams (many-to-many) — mapped to table `maintainers`
- **Team**: id, name (unique), developers — mapped to table `teams`
- **TimeEntry**: id, employee relation, startedAt, endedAt, onCall, createdAt/updatedAt — mapped to table `time_entries`

## 🛠️ Tech Stack

- **Framework**: [DiscordX](https://discordx.js.org/) - Discord.js with decorators
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Dependency Injection**: TSyringe

## 📝 Development Guidelines

1. **Format code before committing**:

```bash
npm run format
```

2. **Create migrations after schema changes**:

```bash
npx prisma migrate dev --name your_migration_name
```

3. **Regenerate Prisma client after schema updates**:

```bash
npx prisma generate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Format your code with `npm run format`
5. Submit a pull request

## 📄 License

MIT License

## 🙏 Acknowledgments

Built with [DiscordX](https://discordx.js.org/) - Create Discord bots with TypeScript and Decorators!

## 💬 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for better team collaboration
