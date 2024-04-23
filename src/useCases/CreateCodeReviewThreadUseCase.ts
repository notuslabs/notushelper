import { injectable } from "tsyringe";
import type { Message, TextChannel } from "discord.js";
import { Discord } from "discordx";
import { reviewers } from "../main.js";

export type CreateCodeReviewThreadInput = {
	message: Message;
	channel: TextChannel;
};

@Discord()
@injectable()
export class CreateCodeReviewThreadUseCase {
	async execute({ channel, message }: CreateCodeReviewThreadInput) {
		const thread = await channel.threads.create({
			name: `Code review: ${message.author.username}`,
			startMessage: message,
		});

		const mentionedReviewers = Array.from(message.mentions.users.keys());
		const currentReviwers: string[] = [];

		if (mentionedReviewers.length === 0) {
			currentReviwers.push(reviewers.next(), reviewers.next());
		} else if (mentionedReviewers.length === 1) {
			currentReviwers.push(
				reviewers.next(mentionedReviewers[0]),
				mentionedReviewers[0],
			);
		} else if (mentionedReviewers.length >= 2) {
			currentReviwers.push(...mentionedReviewers);
		}

		const threadMessage = await thread.send({
			content: `Eu escolho vocês! ${currentReviwers
				.map((id) => `<@${id}>`)
				.join(", ")}!`,
			allowedMentions: {
				parse: [],
			},
		});

		await threadMessage.react("1232346477519437992"); // pokeball
	}
}
