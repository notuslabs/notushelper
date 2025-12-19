import { type Channel, type Message, TextChannel } from "discord.js";
import { Discord } from "discordx";
import { injectable } from "tsyringe";
import { DevelopersRepository } from "../repositories/DevelopersRepository";
import { TeamsRepository } from "../repositories/TeamsRepository";

export type CreateCodeReviewThreadInput = {
	message: Message;
	channel: Channel;
};

@Discord()
@injectable()
export class CreateCodeReviewThreadUseCase {
	constructor(
		private developersRepository: DevelopersRepository,
		private teamsRepository: TeamsRepository,
	) {}

	async execute({ channel, message }: CreateCodeReviewThreadInput) {
		if (!(channel instanceof TextChannel)) return;
		if (channel.id !== process.env.CODE_REVIEW_CHANNEL_ID) return;

		const allUrls = Array.from(
			message.content.matchAll(/(?<url>https?:\/\/[^\s]+)/g),
		).map((url) => new URL(url.groups?.url as string));

		const includesGithub = allUrls.find((url) =>
			url.hostname.includes("github.com"),
		);

		if (!includesGithub) return;

		const thread = await channel.threads.create({
			name: `Code review: ${message.author.username}`,
			startMessage: message,
		});

		const mentionedReviewers = Array.from(message.mentions.users.keys());
		const reviewersNeeded =
			mentionedReviewers.length === 0
				? 2
				: mentionedReviewers.length === 1
					? 1
					: 0;

		let reviewers: string[] = [];

		if (reviewersNeeded > 0) {
			// Determine author's teams first
			const authorTeams = await this.teamsRepository.findTeamsByMemberDiscordId(
				{
					discordUserId: message.author.id,
				},
			);

			const teamIds = authorTeams.map((t) => t.id);
			const excludeDevelopers = [message.author.id, ...mentionedReviewers];

			let selectedDevelopers: { discordUserId: string }[] = [];

			// 1) Try from author's own teams
			if (teamIds.length > 0) {
				selectedDevelopers =
					await this.developersRepository.findDevelopersByTeams({
						teamIds,
						excludeDevelopers,
						limit: reviewersNeeded,
					});
			}

			// 2) If insufficient, fill from outside those teams
			if (selectedDevelopers.length < reviewersNeeded) {
				const remaining = reviewersNeeded - selectedDevelopers.length;
				const outsideDevelopers =
					await this.developersRepository.findDevelopersOutsideTeams({
						teamIds,
						excludeDevelopers: [
							...excludeDevelopers,
							...selectedDevelopers.map((m) => m.discordUserId),
						],
						limit: remaining,
					});
				selectedDevelopers = [...selectedDevelopers, ...outsideDevelopers];
			}

			// 3) Last resort: any remaining from all maintainers (defensive)
			if (selectedDevelopers.length < reviewersNeeded) {
				const remaining = reviewersNeeded - selectedDevelopers.length;
				const anyDevelopers = await this.developersRepository.findAllDevelopers(
					{
						excludeDevelopers: [
							...excludeDevelopers,
							...selectedDevelopers.map((m) => m.discordUserId),
						],
						limit: remaining,
					},
				);
				selectedDevelopers = [...selectedDevelopers, ...anyDevelopers];
			}

			reviewers = [
				...mentionedReviewers,
				...selectedDevelopers.map((m) => m.discordUserId),
			];
		} else {
			// User mentioned 2+ reviewers
			reviewers = mentionedReviewers;
		}

		await this.developersRepository.increaseReviewCount({
			developersIds: reviewers,
		});

		const threadMessage = await thread.send({
			content: `Eu escolho vocês! ${reviewers
				.map((id) => `<@${id}>`)
				.join(", ")}!`,
			allowedMentions: {
				users: reviewers.filter((id) => !mentionedReviewers.includes(id)), // don't mention the mentioned reviewers
			},
		});

		await threadMessage.react("1232346477519437992"); // pokeball
	}
}
