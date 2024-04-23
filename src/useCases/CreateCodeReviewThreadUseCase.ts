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
		const currentReviwers =
			mentionedReviewers.length === 1
				? [mentionedReviewers[0], reviewers.next(mentionedReviewers[0])]
				: mentionedReviewers;

		const threadMessage = await thread.send({
			content: `Eu escolho vocês! ${currentReviwers
				.map((id) => `<@${id}>`)
				.join(", ")}!`,
		});

		await threadMessage.react("1232346477519437992"); // pokeball
	}
}
