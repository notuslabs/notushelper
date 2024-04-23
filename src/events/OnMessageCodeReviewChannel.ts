import { type ArgsOf, Discord, On } from "discordx";
import { CreateCodeReviewThreadUseCase } from "../useCases/CreateCodeReviewThreadUseCase.js";
import { TextChannel } from "discord.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class OnMessageCodeReviewChannel {
	constructor(
		private createCodeReviewThreadUseCase: CreateCodeReviewThreadUseCase,
	) {}

	@On({ event: "messageCreate" })
	async onMessageCodeReviewChannel([message]: ArgsOf<"messageCreate">) {
		if (!(message.channel instanceof TextChannel)) return;
		if (message.channel.id !== "1158447233360994476") return;

		const allUrls = Array.from(
			message.content.matchAll(/(?<url>https?:\/\/[^\s]+)/g),
		).map((url) => new URL(url.groups?.url as string));

		const includesGithub = allUrls.some((url) => url.hostname === "github.com");

		if (!includesGithub) return;

		await this.createCodeReviewThreadUseCase.execute({
			message,
			channel: message.channel,
		});
	}
}
