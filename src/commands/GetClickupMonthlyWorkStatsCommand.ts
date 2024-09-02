import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { GetClickupMonthlyStatsUseCase } from "../useCases/GetClickupMonthlyStatsUseCase.js";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import dayjs from "dayjs";
import { SearchMembersByTeamUseCase } from "../useCases/SearchMembersByTeamUseCase.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class GetClickupMonthlyWorkStatsCommand {
	constructor(
		private getClickupMonthlyStatsUseCase: GetClickupMonthlyStatsUseCase,
	) {}

	@Slash({
		name: "clickup-monthlystats",
		description: "Get your monthly ClickUp work statistics",
	})
	async handle(
		@SlashOption({
			name: "usuario",
			autocomplete: async (interaction) => {
				const searchMembersByTeamUseCase = new SearchMembersByTeamUseCase();

				const results = await searchMembersByTeamUseCase.execute({
					query: interaction.options.getFocused(),
					teamId: process.env.CLICKUP_TEAM_ID || "",
				});

				await interaction.respond(
					results.map((member) => ({
						name: member.item.username,
						value: member.item.id,
					})),
				);
			},
			description: "Seu usuário no Clickup",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		clickUpUserId: string,

		@SlashChoice(
			{ name: "January", value: 0 },
			{ name: "February", value: 1 },
			{ name: "March", value: 2 },
			{ name: "April", value: 3 },
			{ name: "May", value: 4 },
			{ name: "June", value: 5 },
			{ name: "July", value: 6 },
			{ name: "August", value: 7 },
			{ name: "September", value: 8 },
			{ name: "October", value: 9 },
			{ name: "November", value: 10 },
			{ name: "December", value: 11 },
		)
		@SlashOption({
			name: "month",
			description: "month to get the stats from (optional)",
			required: false,
			type: ApplicationCommandOptionType.Integer,
		})
		month = 7, // september is the last month where we used clickup until now

		@SlashOption({
			name: "year",
			description: "year to get the stats from (optional)",
			required: false,
			type: ApplicationCommandOptionType.Integer,
		})
		year: number = dayjs().year(),

		interaction: CommandInteraction,
	) {
		const { timeWorked, salary } =
			await this.getClickupMonthlyStatsUseCase.execute({
				clickUpUserId,
				discordUserId: interaction.user.id,
				month,
				year,
			});

		const hoursWorkedEmbed = new EmbedBuilder()
			.setTitle(
				`ClickUp Work statistics - ${dayjs().month(month).format("MMMM")}`,
			)
			.setDescription("Hey! Looking for some monthly ClickUp work statistics?")
			.setColor("#fe9b69")
			.addFields({
				name: "Hours worked:",
				value: timeWorked,
				inline: true,
			});

		if (salary) {
			hoursWorkedEmbed.addFields({
				name: "Salary:",
				value: salary,
				inline: true,
			});
		}

		await interaction.followUp({
			embeds: [hoursWorkedEmbed],
		});
	}
}
