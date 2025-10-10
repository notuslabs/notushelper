import { Exception } from "../helpers/Exception.js";
import { prisma } from "../main.js";

export type StartTimeTrackingUseCaseInput = {
	discordUserId: string;
	onCall?: boolean;
};

export class StartTimeTrackingUseCase {
	async execute({ discordUserId, onCall }: StartTimeTrackingUseCaseInput) {
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

		if (runningTimeEntry) {
			throw new Exception(
				`You're already tracking time.`,
				"already_tracking_time",
			);
		}

		await prisma.timeEntry.create({
			data: {
				employeeId: employee.id,
				onCall,
			},
		});
	}
}
