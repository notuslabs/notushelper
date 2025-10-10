import { injectable } from "tsyringe";
import { DevelopersRepository } from "../repositories/DevelopersRepository.js";

export type GetReviewLeaderboardOutput = {
	name: string;
	discordUserId: string;
	reviewCount: number;
	roles: string[];
}[];

@injectable()
export class GetReviewLeaderboardUseCase {
	constructor(private developersRepository: DevelopersRepository) {}

	async execute(): Promise<GetReviewLeaderboardOutput> {
		const developers =
			await this.developersRepository.findAllDevelopersSortedByReviews();

		return developers.map((developer) => ({
			name: developer.name,
			discordUserId: developer.discordUserId,
			reviewCount: developer.reviewCount,
			roles: developer.role,
		}));
	}
}
