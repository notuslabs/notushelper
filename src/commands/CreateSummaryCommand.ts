import { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { CreateSummaryUseCase } from "../useCases/CreateSummaryUseCase.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class CreateSummaryCommand {
	constructor(private createSummaryUseCase: CreateSummaryUseCase) {}

	@Slash({
		name: "create-summary",
		description: "Create a summary",
	})
	async execute(interaction: CommandInteraction) {
		await this.createSummaryUseCase.execute(interaction);
	}
}
