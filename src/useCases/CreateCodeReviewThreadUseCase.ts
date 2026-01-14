import { type Channel, type Message, TextChannel } from "discord.js";
import { Discord } from "discordx";
import { injectable } from "tsyringe";
import { DevelopersRepository } from "../repositories/DevelopersRepository";

export type CreateCodeReviewThreadInput = {
	message: Message;
	channel: Channel;
};

@Discord()
@injectable()
export class CreateCodeReviewThreadUseCase {
	constructor(private developersRepository: DevelopersRepository) {}

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
			const excludeDevelopers = [message.author.id, ...mentionedReviewers];

			const selectedDevelopers =
				await this.developersRepository.findAllDevelopers({
					excludeDevelopers,
					limit: reviewersNeeded,
				});

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

		await this.developersRepository.moveToEndOfQueue({
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
