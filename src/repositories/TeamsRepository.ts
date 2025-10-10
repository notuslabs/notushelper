import { prisma } from "../main.js";

export type FindTeamByNameInput = {
	name: string;
};

export type FindTeamsByMemberDiscordIdInput = {
	discordUserId: string;
};

export class TeamsRepository {
	async findTeamByName({ name }: FindTeamByNameInput) {
		const team = await prisma.team.findFirst({
			where: { name },
		});

		return team;
	}

	async findTeamsByMemberDiscordId({
		discordUserId,
	}: FindTeamsByMemberDiscordIdInput) {
		const teams = await prisma.team.findMany({
			where: {
				developers: {
					some: {
						discordUserId,
					},
				},
			},
		});

		return teams;
	}
}
