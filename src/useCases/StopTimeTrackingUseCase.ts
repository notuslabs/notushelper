import { Exception } from "../helpers/Exception.js";
import { prisma } from "../main.js";

export type StopTimeTrackingUseCaseInput = {
	discordUserId: string;
};

export class StopTimeTrackingUseCase {
	async execute({ discordUserId }: StopTimeTrackingUseCaseInput) {
		const employee = await prisma.employee.findUnique({
			where: { discordUserId },
		});

		if (!employee) {
			throw new Exception(
				"You're not in the system. Please use the `/setup init` command.",
				"employee_not_found",
			);
		}

		const runningTimeEntry = await prisma.timeEntry.findFirst({
			where: {
				employeeId: employee.id,
				endedAt: null,
			},
		});

		if (!runningTimeEntry) {
			throw new Exception(`You're not tracking time.`, "not_tracking_time");
		}

		await prisma.timeEntry.update({
			where: {
				id: runningTimeEntry.id,
			},
			data: {
				endedAt: new Date(),
			},
		});
	}
}
