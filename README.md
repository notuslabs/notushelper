# 🤖 NotusHelper

A Discord bot built with TypeScript and DiscordX that helps manage code reviews, time tracking, and team productivity for software development teams.

## ✨ Features

### 📝 Code Review Management

- **Automated Reviewer Assignment**: Automatically assigns code reviewers when PRs are posted in designated channels
- **Smart Round-Robin Distribution**: Uses a fair round-robin algorithm based on review counts to distribute work evenly
- **Project-Aware**: Prioritizes reviewers who are developers of the specific project being reviewed
- **Review Leaderboard**: Track and display code review statistics for team members

### ⏱️ Time Tracking

- **Start/Stop Time Tracking**: Simple commands to track work hours
- **Daily & Monthly Statistics**: View work statistics for individuals or teams
- **ClickUp Integration**: Syncs with ClickUp for comprehensive time tracking

### 🎯 Project Features

- Multi-project support with role-based focus (Frontend/Backend)
- Developer management with project assignments
- Configurable review assignment logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18.16.0
- npm 9.5.1 or pnpm 9.12.2+
- PostgreSQL database
- Discord Bot Token
- ClickUp API Token (optional, for time tracking features)

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
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DATABASE_URL=postgresql://user:password@localhost:5432/notushelper
CODE_REVIEW_CHANNEL_ID=your_code_review_channel_id
CLICKUP_API_KEY=your_clickup_api_key # optional
CLICKUP_TEAM_ID=your_clickup_team_id # optional
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
# Add your developers, projects, and project assignments
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

- `/setup` - Configure the bot for your server
- View review leaderboard - See who's been doing the most reviews

### Time Tracking Commands

- `/start` - Start tracking time
- `/stop` - Stop tracking time
- `/daily-stats` - View daily work statistics
- `/monthly-stats` - View monthly work statistics

### Help

- `/help` - Display all available commands

## 🔧 Configuration

### Setting Up Projects

1. Edit your `src/seed.ts` file (this file is gitignored for security)
2. Add your projects to the `projects` array:

```typescript
const projects: Prisma.ProjectUpsertArgs[] = [
  {
    where: { name: "your-project-name" },
    create: {
      name: "your-project-name",
      roleFocus: "FRONTEND", // or "BACKEND"
    },
    update: {},
  },
];
```

### Setting Up Developers

Add your developers to the `developers` array:

```typescript
const developers: Prisma.MaintainerUpsertArgs[] = [
  {
    where: { discordUserId: "discord_user_id" },
    create: {
      name: "Developer Name",
      discordUserId: "discord_user_id",
      role: ["FRONTEND"], // can be ["FRONTEND"], ["BACKEND"], or both
    },
    update: {},
  },
];
```

### Assigning Developers to Projects

Configure the `maintainerProjectConnections` array to specify which developers work on which projects:

```typescript
const maintainerProjectConnections: Array<{
  maintainerDiscordId: string;
  projectNames: string[];
}> = [
  {
    maintainerDiscordId: "discord_user_id",
    projectNames: ["project-1", "project-2"],
  },
];
```

## 🎯 How Code Review Assignment Works

1. When a GitHub PR link is posted in the code review channel, the bot:

   - Identifies the project from the repository name
   - Looks for developers assigned to that project
   - Selects reviewers with the lowest review count (round-robin)
   - If not enough project developers are available, fills remaining slots with other developers
   - Creates a thread and mentions the selected reviewers

2. The review count automatically increments for assigned reviewers, ensuring fair distribution over time

3. If reviewers are manually mentioned in the message, the bot respects those mentions

## 🗂️ Database Schema

The bot uses PostgreSQL with Prisma ORM. Main entities:

- **Employee**: Tracks employees with salary and time tracking information
- **Developer**: Code reviewers with project assignments
- **Project**: Software projects with role focus
- **TimeEntry**: Time tracking records
- **DisplayChannel**: Configuration for special display channels

## 🛠️ Tech Stack

- **Framework**: [DiscordX](https://discordx.js.org/) - Discord.js with decorators
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Dependency Injection**: TSyringe
- **API Integrations**: ClickUp

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
