import { Discord, Guard, Slash, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { StartTimeTrackingUseCase } from "../useCases/StartTimeTrackingUseCase";

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
	async handle(
		@SlashOption({
			name: "on-call",
			description: "If you're on call",
			required: false,
			type: ApplicationCommandOptionType.Boolean,
		})
		onCall = false,

		interaction: CommandInteraction,
	) {
		const discordUserId = interaction.user.id;

		await this.startTimeTrackingUseCase.execute({
			discordUserId,
			onCall,
		});

		await interaction.followUp({
			content: "Time tracking started",
		});
	}
}
