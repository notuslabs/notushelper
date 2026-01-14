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

export type MoveToEndOfQueueInput = {
	developersIds: string[];
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
				sequenceIndex: "asc",
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
				sequenceIndex: "asc",
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
			"Project-based selection was removed; use findAllDevelopers.",
			"PROJECTS_REMOVED",
		);
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
				sequenceIndex: "asc",
			},
			take: limit,
		});

		return developers;
	}

	async moveToEndOfQueue({ developersIds }: MoveToEndOfQueueInput) {
		const maxSequence = await prisma.developer.aggregate({
			_max: { sequenceIndex: true },
		});
		let nextIndex = (maxSequence._max.sequenceIndex ?? 0) + 1;

		for (const discordUserId of developersIds) {
			await prisma.developer.update({
				where: { discordUserId },
				data: { sequenceIndex: nextIndex++ },
			});
		}
	}
}
