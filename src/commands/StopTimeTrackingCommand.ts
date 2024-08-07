import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { StopTimeTrackingUseCase } from "../useCases/StopTimeTrackingUseCase.js";
import { CommandInteraction } from "discord.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class StopTimeTrackingCommand {
	constructor(
		private readonly stopTimeTrackingUseCase: StopTimeTrackingUseCase,
	) {}

	@Slash({
		name: "stop-time-tracking",
		description: "Stop time tracking",
	})
	async handle(interaction: CommandInteraction) {
		const discordUserId = interaction.user.id;

		await this.stopTimeTrackingUseCase.execute({
			discordUserId,
		});

		await interaction.followUp({
			content: "Time tracking stopped",
		});
	}
}
