import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { CommandInteraction } from "discord.js";
import { StartTimeTrackingUseCase } from "../useCases/StartTimeTrackingUseCase.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class StartTimeTrackingCommand {
	constructor(
		private readonly startTimeTrackingUseCase: StartTimeTrackingUseCase,
	) {}

	@Slash({
		name: "start-time-tracking",
		description: "Start time tracking",
	})
	async handle(interaction: CommandInteraction) {
		const discordUserId = interaction.user.id;

		await this.startTimeTrackingUseCase.execute({
			discordUserId,
		});

		await interaction.followUp({
			content: "Time tracking started",
		});
	}
}
