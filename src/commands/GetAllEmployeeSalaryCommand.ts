import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { GetAllEmployeesSalaryUseCase } from "../useCases/GetAllEmployeesSalaryUseCase.js";
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import dayjs from "dayjs";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class GetAllEmployeeSalaryCommand {
	constructor(
		private getAllEmployeesSalaryUseCase: GetAllEmployeesSalaryUseCase,
	) {}

	@Slash({
		name: "allsalaries",
		description: `Get all employees salaries (only ${process.env.ALLOWED_SALARY_REQUESTERS_IDS?.split(
			",",
		)
			?.map((id) => `<@${id}>`)
			.join(", ")} can see this)`,
	})
	async execute(
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
			description: "month to get the stats from",
			required: false,
			type: ApplicationCommandOptionType.Integer,
		})
		month: number = dayjs().subtract(1, "month").month(),

		interaction: CommandInteraction,
	) {
		const allsalaries = await this.getAllEmployeesSalaryUseCase.execute({
			month,
			requestBy: interaction.user.id,
		});

		const salaries = allsalaries
			.map(({ discordUserId, salary, timeWorked, salaryPerHour }) => {
				return `<@${discordUserId}> - ${salary} (R$${salaryPerHour}/h) - ${timeWorked}`;
			})
			.join("\n");

		const salariesEmbed = new EmbedBuilder();
		salariesEmbed.setTitle(
			`All salaries - ${dayjs().month(month).format("MMMM")}`,
		);
		salariesEmbed.setDescription(`Hey! Here are all the salaries`);
		salariesEmbed.setColor("#fe9b69");
		salariesEmbed.addFields({
			name: "Salaries:",
			value: salaries,
			inline: true,
		});

		await interaction.followUp({
			embeds: [salariesEmbed],
		});
	}
}
