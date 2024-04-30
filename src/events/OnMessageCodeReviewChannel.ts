import { type ArgsOf, Discord, On } from "discordx";
import { CreateCodeReviewThreadUseCase } from "../useCases/CreateCodeReviewThreadUseCase.js";
import { injectable } from "tsyringe";
import { Exception } from "../helpers/Exception.js";

@Discord()
@injectable()
export class OnMessageCodeReviewChannel {
	constructor(
		private createCodeReviewThreadUseCase: CreateCodeReviewThreadUseCase,
	) {}

	@On({ event: "messageCreate" })
	async onMessageCodeReviewChannel([message]: ArgsOf<"messageCreate">) {
		try {
			await this.createCodeReviewThreadUseCase.execute({
				message,
				channel: message.channel,
			});
		} catch (error) {
			if (error instanceof Exception) {
				await message.reply(`[${error.name}]: ${error.message}`);
			}
			console.error(error);
		}
	}
}
