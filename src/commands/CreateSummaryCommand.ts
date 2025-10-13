import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { Exception } from "../helpers/Exception.js";
import { CreateSummaryUseCase } from "../useCases/CreateSummaryUseCase.js";

@Discord()
@injectable()
export class CreateSummaryCommand {
	constructor(private createSummaryUseCase: CreateSummaryUseCase) {}

	@Slash({
		name: "create-summary",
		description: "Create a summary",
	})
	async execute(
		@SlashOption({
			name: "ephemeral",
			description: "If the summary should be ephemeral",
			required: false,
			type: ApplicationCommandOptionType.Boolean,
		})
		ephemeral = true,
		interaction: CommandInteraction,
	) {
		try {
			await interaction.deferReply({ ephemeral });
			await this.createSummaryUseCase.execute(interaction);
		} catch (error) {
			if (error instanceof Exception) {
				await interaction.followUp(error.message);
				return;
			}

			await interaction.followUp(`Unexpected error occurred. ${error}`);
		}
	}
}
