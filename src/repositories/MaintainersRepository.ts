import { Role } from "@prisma/client";
import { prisma } from "../main.js";
import { Exception } from "../helpers/Exception.js";

export type FindMaintainerByRoleWithLeastReviewsInput = {
	role: Role;
	excludeMaintainers: string[];
};

export type FindMaintainerWithLeastReviewsInput = {
	excludeMaintainers: string[];
};

export type IncreaseReviewCountInput = {
	maintainersIds: string[];
};

export class MaintainersRepository {
	async findMaintainerByRoleWithLeastReviews({
		role,
		excludeMaintainers,
	}: FindMaintainerByRoleWithLeastReviewsInput) {
		const maintainer = await prisma.maintainer.findFirst({
			where: {
				role: {
					has: role,
				},
				discordUserId: {
					notIn: excludeMaintainers,
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
		});

		if (!maintainer) {
			throw new Exception(
				"No maintainers found with the given role",
				"NO_MAINTAINERS_FOUND",
			);
		}

		return maintainer;
	}

	async findMaintainerWithLeastReviews({
		excludeMaintainers,
	}: FindMaintainerWithLeastReviewsInput) {
		const maintainer = await prisma.maintainer.findFirst({
			where: {
				discordUserId: {
					notIn: excludeMaintainers,
				},
			},
			orderBy: {
				reviewCount: "asc",
			},
		});

		if (!maintainer) {
			throw new Exception(
				"No maintainers found with least reviews",
				"NO_MAINTAINERS_FOUND",
			);
		}

		return maintainer;
	}

	async increaseReviewCount({ maintainersIds }: IncreaseReviewCountInput) {
		await prisma.maintainer.updateMany({
			where: {
				discordUserId: {
					in: maintainersIds,
				},
			},
			data: {
				reviewCount: {
					increment: 1,
				},
			},
		});
	}
}
