import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { GetAllEmployeesUseCase } from "../useCases/GetAllEmployeesUseCase.js";
import { CommandInteraction, EmbedBuilder } from "discord.js";

@Discord()
@Guard(InteractionExceptionHandler(false))
@injectable()
export class GetAllEmployeesCommand {
	constructor(private getAllEmployeesUseCase: GetAllEmployeesUseCase) {}

	@Slash({
		name: "get-all-employees",
		description: "Get all employees",
	})
	async execute(interaction: CommandInteraction) {
		const employees = await this.getAllEmployeesUseCase.execute();

		const employeesList = employees
			.map((employee) => {
				return `<@${employee.discordUserId}>`;
			})
			.join("\n");

		const employeesEmbed = new EmbedBuilder();
		employeesEmbed.setTitle("All Employees");
		employeesEmbed.setDescription(employeesList);
		employeesEmbed.setColor("#fe9b69");

		await interaction.followUp({
			embeds: [employeesEmbed],
		});
	}
}
