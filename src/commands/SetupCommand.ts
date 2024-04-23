import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import { SearchMembersByTeamUseCase } from "../useCases/SearchMembersByTeamUseCase.js";
import { CreateEmployeeUseCase } from "../useCases/CreateEmployeeUseCase.js";
import { UpdateEmployeeUseCase } from "../useCases/UpdateEmployeeUseCase.js";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";

@Discord()
@SlashGroup({ name: "setup", description: "Setup employee" })
@Guard(InteractionExceptionHandler(true))
@injectable()
export class SetupCommand {
	constructor(
		private setupEmployeeUseCase: CreateEmployeeUseCase,
		private updateEmployeeUseCase: UpdateEmployeeUseCase,
	) {}

	@Slash({
		name: "init",
		description: "Setup your configuration",
	})
	@SlashGroup("setup")
	async handle(
		@SlashOption({
			name: "salario_hora",
			required: true,
			type: ApplicationCommandOptionType.Number,
			description:
				"Quanto você ganha por hora? E.g. 14,5 (Apenas pessoas que já sabem seu salário podem ver)",
		})
		salaryPerHour: number,

		@SlashOption({
			name: "carga_horaria_dia",
			required: true,
			type: ApplicationCommandOptionType.Number,
			description: "Quantas horas você trabalha por dia?",
		})
		workloadPerDay: number,

		@SlashOption({
			name: "usuario",
			autocomplete: async (interaction, command) => {
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
		clickUpUserId: number,

		interaction: CommandInteraction,
	) {
		if (!interaction.inGuild()) {
			await interaction.reply("Esse comando só pode ser usado em um servidor!");
			return;
		}

		await this.setupEmployeeUseCase.execute({
			clickUpUserId,
			discordUserId: interaction.user.id,
			salaryPerHour,
			username: interaction.user.username,
			workloadPerDay,
		});

		await interaction.followUp(
			`Setup realizado com sucesso! Você pode usar o comando \`/monthlystats-work\` para ver suas estatísticas de trabalho.`,
		);
	}

	@Slash({
		name: "update",
		description: "Atualiza suas configurações",
	})
	@SlashGroup("setup")
	async update(
		@SlashOption({
			name: "salario_hora",
			required: true,
			type: ApplicationCommandOptionType.Number,
			description:
				"Quanto você ganha por hora? E.g. 14,5 (Apenas pessoas que já sabem seu salário podem ver)",
		})
		salaryPerHour: number,

		@SlashOption({
			name: "carga_horaria_dia",
			required: true,
			type: ApplicationCommandOptionType.Number,
			description: "Quantas horas você trabalha por dia?",
		})
		workloadPerDay: number,

		@SlashOption({
			name: "usuario",
			autocomplete: async (interaction, command) => {
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
		clickUpUserId: number,

		interaction: CommandInteraction,
	) {
		if (!interaction.inGuild()) {
			await interaction.reply("Esse comando só pode ser usado em um servidor!");
			return;
		}

		await this.updateEmployeeUseCase.execute({
			clickUpUserId,
			discordUserId: interaction.user.id,
			salaryPerHour,
			username: interaction.user.username,
			workloadPerDay,
		});

		await interaction.followUp(`Setup atualizado com sucesso!`);
	}
}
