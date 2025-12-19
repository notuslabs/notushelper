import { Role } from "../generated/prisma/client";
import { Exception } from "../helpers/Exception";
import { prisma } from "../main";

export type FindDeveloperByRoleWithLeastReviewsInput = {
	role: Role;
	excludeDevelopers: string[];
};

export type FindDeveloperWithLeastReviewsInput = {
	excludeDevelopers: string[];
};

export type IncreaseReviewCountInput = {
	developersIds: string[];
};

export type FindDevelopersByProjectInput = {
	projectId: string;
	excludeDevelopers: string[];
	limit?: number;
};

export type FindDevelopersByTeamInput = {
	teamId: string;
	excludeDevelopers: string[];
	limit?: number;
};

export type FindDevelopersByTeamsInput = {
	teamIds: string[];
	excludeDevelopers: string[];
	limit?: number;
};

export type FindDevelopersOutsideTeamsInput = {
	teamIds: string[];
	excludeDevelopers: string[];
	limit?: number;
};

export class DevelopersRepository {
	async findDeveloperByRoleWithLeastReviews({
		role,
		excludeDevelopers,
	}: FindDeveloperByRoleWithLeastReviewsInput) {
		const developer = await prisma.developer.findFirst({
			where: {
				role: {
					has: role,
				},
				discordUserId: {
					notIn: excludeDevelopers,
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
		});

		if (!developer) {
			throw new Exception(
				"No developers found with the given role",
				"NO_DEVELOPERS_FOUND",
			);
		}

		return developer;
	}

	async findDeveloperWithLeastReviews({
		excludeDevelopers,
	}: FindDeveloperWithLeastReviewsInput) {
		const developer = await prisma.developer.findFirst({
			where: {
				discordUserId: {
					notIn: excludeDevelopers,
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
		});

		if (!developer) {
			throw new Exception(
				"No developers found with least reviews",
				"NO_DEVELOPERS_FOUND",
			);
		}

		return developer;
	}

	async increaseReviewCount({ developersIds }: IncreaseReviewCountInput) {
		await prisma.developer.updateMany({
			where: {
				discordUserId: {
					in: developersIds,
				},
			},
			data: {
				reviewCount: {
					increment: 1,
				},
			},
		});
	}

	async findAllDevelopersSortedByReviews() {
		return await prisma.developer.findMany({
			orderBy: {
				reviewCount: "desc",
			},
		});
	}

	async findDevelopersByProject({ projectId }: FindDevelopersByProjectInput) {
		throw new Exception(
			"Project-based selection was removed; use team-based methods.",
			"PROJECTS_REMOVED",
		);
	}

	async findDevelopersByTeam({
		teamId,
		excludeDevelopers,
		limit = 2,
	}: FindDevelopersByTeamInput) {
		const developers = await prisma.developer.findMany({
			where: {
				discordUserId: {
					notIn: excludeDevelopers,
				},
				teams: {
					some: {
						id: teamId,
					},
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
			take: limit,
		});

		return developers;
	}

	async findDevelopersByTeams({
		teamIds,
		excludeDevelopers,
		limit = 2,
	}: FindDevelopersByTeamsInput) {
		if (teamIds.length === 0) return [];

		const developers = await prisma.developer.findMany({
			where: {
				discordUserId: {
					notIn: excludeDevelopers,
				},
				teams: {
					some: {
						id: {
							in: teamIds,
						},
					},
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
			take: limit,
		});

		return developers;
	}

	async findDevelopersOutsideTeams({
		teamIds,
		excludeDevelopers,
		limit = 2,
	}: FindDevelopersOutsideTeamsInput) {
		const developers = await prisma.developer.findMany({
			where: {
				discordUserId: {
					notIn: excludeDevelopers,
				},
				...(teamIds.length > 0
					? {
							teams: {
								none: {
									id: { in: teamIds },
								},
							},
						}
					: {}),
			},
			orderBy: {
				reviewCount: "asc",
			},
			take: limit,
		});

		return developers;
	}

	async findAllDevelopers({
		excludeDevelopers,
		limit = 2,
	}: {
		excludeDevelopers: string[];
		limit?: number;
	}) {
		const developers = await prisma.developer.findMany({
			where: {
				discordUserId: {
					notIn: excludeDevelopers,
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
			take: limit,
		});

		return developers;
	}
}
