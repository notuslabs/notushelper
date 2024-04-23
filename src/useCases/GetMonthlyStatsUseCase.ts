import { client } from "../clients/clickup.js";
import { Exception } from "../helpers/Exception.js";
import { prisma } from "../main.js";
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

		const [timeTrackingEntries, currentTimeTracking] = await Promise.all([
			await client.timeTracking.getTimeTrackingEntries({
				teamId: process.env.CLICKUP_TEAM_ID || "",
				startDate: firstDayOfTheMonth.getTime(),
				endDate: lastDayOfTheMonth.getTime(),
				assignee: employee.clickUpUserId.toString(),
			}),
			month === dayjs().month()
				? await client.timeTracking.getTimeTrackingRunning({
						teamId: process.env.CLICKUP_TEAM_ID || "",
						assignee: employee.clickUpUserId.toString(),
					})
				: null,
		]);

		const { duration: timeWorkedInMS } = timeTrackingEntries.reduce(
			(pTime, cTime) => ({
				duration: Number(pTime.duration) + Number(cTime.duration),
			}),
			{ duration: Math.abs(Number(currentTimeTracking?.duration ?? 0)) },
		);

		const timeWorkedInHours = timeWorkedInMS / 3.6e6;

		const hours = Math.floor(timeWorkedInMS / 3.6e6);
		const minutes = Math.floor((timeWorkedInMS % 3.6e6) / 6e4);
		const seconds = Math.floor((timeWorkedInMS % 6e4) / 1e3);

		return {
			timeWorked: `${hours}:${minutes}:${seconds}`,
			salary: (employee.salaryPerHour * timeWorkedInHours).toFixed(2),
		};
	}
}
