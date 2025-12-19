import { Prisma, PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const developers: Prisma.DeveloperUpsertArgs[] = [
	{
		where: {
			discordUserId: "REPLACE_ME_DISCORD_USER_ID",
		},
		create: {
			name: "Your Name",
			discordUserId: "REPLACE_ME_DISCORD_USER_ID",
			role: ["FRONTEND"],
		},
		update: {},
	},
];

const teams: Prisma.TeamUpsertArgs[] = [
	{
		where: { name: "Your Team Name" },
		create: {
			name: "Your Team Name",
			developers: {
				connect: [{ discordUserId: "REPLACE_ME_DISCORD_USER_ID" }],
			},
		},
		update: {},
	},
];

await prisma.$transaction([
	...developers.map((developer) => prisma.developer.upsert(developer)),
	...teams.map((team) => prisma.team.upsert(team)),
]);
