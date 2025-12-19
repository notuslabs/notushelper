import { injectable } from "tsyringe";
import { Exception } from "../helpers/Exception";
import { prisma } from "../main";

export type SetupUseCaseInput = {
	username: string;
	discordUserId: string;
	salaryPerHour: number;
	workloadPerDay: number;
};

@injectable()
export class CreateEmployeeUseCase {
	async execute({
		discordUserId,
		salaryPerHour,
		workloadPerDay,
		username,
	}: SetupUseCaseInput) {
		const employeeExists = await prisma.employee.findUnique({
			where: { discordUserId },
		});

		if (employeeExists) {
			throw new Exception(
				"You have already run this command. Please use the `/setup update` command.",
				"employee_already_exists",
			);
		}

		const employee = await prisma.employee.create({
			data: {
				discordUserId,
				salaryPerHour,
				workloadPerDay,
				name: username,
			},
		});

		return employee;
	}
}
