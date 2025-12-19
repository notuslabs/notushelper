import { Exception } from "../helpers/Exception";
import { prisma } from "../main";
import dayjs from "dayjs";

export type GetWorkStatsUseCaseInput = {
	discordUserId: string;
	year?: number | undefined;
	month?: number | undefined;
};

export class GetMonthlyStatsUseCase {
	async execute({
		discordUserId,
		year = dayjs().year(),
		month = dayjs().month(),
	}: GetWorkStatsUseCaseInput) {
		const employee = await prisma.employee.findUnique({
			where: { discordUserId: discordUserId },
		});

		if (!employee) {
			throw new Exception(
				"You're not in the system. Please use the `/setup init` command.",
				"employee_not_found",
			);
		}

		const firstDayOfTheMonth = dayjs()
			.year(year)
			.month(month)
			.startOf("month")
			.toDate();
		const lastDayOfTheMonth = dayjs()
			.year(year)
			.month(month)
			.endOf("month")
			.toDate();

		const timeTrackingEntries = await prisma.timeEntry.findMany({
			where: {
				employeeId: employee.id,
				createdAt: {
					gte: firstDayOfTheMonth,
					lt: lastDayOfTheMonth,
				},
			},
		});

		const { duration: timeWorkedInMS } = timeTrackingEntries
			.filter((timeEntry) => !timeEntry.onCall)
			.reduce(
				(pTime, cTime) => ({
					duration: Number(pTime.duration) + Number(cTime.durationInMS),
				}),
				{ duration: 0 },
			);

		const { duration: timeWorkedInOnCallMS } = timeTrackingEntries
			.filter((timeEntry) => timeEntry.onCall)
			.reduce(
				(pTime, cTime) => ({
					duration: Number(pTime.duration) + Number(cTime.durationInMS),
				}),
				{ duration: 0 },
			);

		const timeWorkedInHours = timeWorkedInMS / 3.6e6;
		const timeWorkedInOnCallHours = timeWorkedInOnCallMS / 3.6e6;

		const timeWorkedInHoursSalary = employee.salaryPerHour * timeWorkedInHours;

		// On call is 2x the salary per hour
		const timeWorkedInOnCallHoursSalary =
			employee.salaryPerHour * 2 * timeWorkedInOnCallHours;

		const totalHoursWorkedInMS = timeWorkedInMS + timeWorkedInOnCallMS;

		const hours = Math.floor(totalHoursWorkedInMS / 3.6e6);
		const minutes = Math.floor((totalHoursWorkedInMS % 3.6e6) / 6e4);
		const seconds = Math.floor((totalHoursWorkedInMS % 6e4) / 1e3);

		return {
			timeWorked: `${hours}:${minutes}:${seconds}`,
			salary: (timeWorkedInHoursSalary + timeWorkedInOnCallHoursSalary).toFixed(
				2,
			),
			timeWorkedInHoursSalary: timeWorkedInHoursSalary.toFixed(2),
			timeWorkedInOnCallHoursSalary: timeWorkedInOnCallHoursSalary.toFixed(2),
		};
	}
}
