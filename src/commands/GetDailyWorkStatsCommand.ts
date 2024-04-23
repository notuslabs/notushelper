import { Discord, Guard, Slash } from "discordx";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { injectable } from "tsyringe";
import { GetDailyWorkStatsUseCase } from "../useCases/GetDailyWorkStatsUseCase.js";
import { CommandInteraction, EmbedBuilder } from "discord.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class GetDailyWorkStatsCommand {
	constructor(private getDailyWorkStatsUseCase: GetDailyWorkStatsUseCase) {}

	@Slash({
		name: "dailystats-work",
		description: "Get your daily work statistics",
	})
	async execute(interaction: CommandInteraction) {
		const { timeWorkedHumanReadable, finishWorkAt } =
			await this.getDailyWorkStatsUseCase.execute({
				discordUserId: interaction.user.id,
			});

		const statsWorkEmbed = new EmbedBuilder()
			.setTitle(`Work statistics`)
			.setDescription(`Hey! Looking for some daily work statistics?`)
			.setColor("#fe9b69")
			.addFields({
				name: "Hours worked:",
				value: timeWorkedHumanReadable,
				inline: true,
			})
			.addFields({
				name: "You'll finish your work at:",
				value: finishWorkAt,
			});

		await interaction.followUp({
			embeds: [statsWorkEmbed],
		});
	}
}
