import { Exception } from "../helpers/Exception.js";
import { prisma } from "../main.js";

export type UpdateEmployeeInput = {
	discordUserId: string;
	salaryPerHour: number;
	workloadPerDay: number;
	clickUpUserId: number;
	username: string;
};

export class UpdateEmployeeUseCase {
	async execute({
		discordUserId,
		salaryPerHour,
		workloadPerDay,
		clickUpUserId,
		username,
	}: UpdateEmployeeInput) {
		const employeeExists = await prisma.employee.findUnique({
			where: { discordUserId },
		});

		if (!employeeExists) {
			throw new Exception(
				"You're not in the system. Please use the `/setup init` command.",
				"user_not_registered",
			);
		}

		const employeeWithSameClickUpId = await prisma.employee.findUnique({
			where: { clickUpUserId },
		});

		if (
			employeeWithSameClickUpId &&
			employeeWithSameClickUpId.id !== employeeExists.id
		) {
			throw new Exception(
				`The employee <@${employeeWithSameClickUpId.discordUserId}> is already using the ClickUp user you provided.`,
				"clickup_id_already_exists",
			);
		}

		const employee = await prisma.employee.update({
			where: { discordUserId },
			data: {
				salaryPerHour,
				workloadPerDay,
				clickUpUserId,
				name: username,
			},
		});

		return employee;
	}
}
