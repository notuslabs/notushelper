import { client } from "../clients/clickup.js";
import dayjs from "dayjs";
import { prisma } from "../main.js";

export type GetClickupMonthlyStatsUseCaseInput = {
	clickUpUserId: string;
	discordUserId?: string;
	year?: number | undefined;
	month?: number | undefined;
};

export class GetClickupMonthlyStatsUseCase {
	async execute({
		clickUpUserId,
		discordUserId,
		year = dayjs().year(),
		month = 7, // september is the last month where we used clickup until now
	}: GetClickupMonthlyStatsUseCaseInput) {
		const employeeExists = discordUserId
			? await prisma.employee.findUnique({
					where: {
						discordUserId: discordUserId,
					},
				})
			: null;

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
				assignee: clickUpUserId,
			}),
			month === dayjs().month()
				? await client.timeTracking.getTimeTrackingRunning({
						teamId: process.env.CLICKUP_TEAM_ID || "",
						assignee: clickUpUserId,
					})
				: null,
		]);

		const { duration: timeWorkedInMS } = timeTrackingEntries.reduce(
			(pTime, cTime) => ({
				duration: Number(pTime.duration) + Number(cTime.duration),
			}),
			{ duration: Math.abs(Number(currentTimeTracking?.duration ?? 0)) },
		);

		const hours = Math.floor(timeWorkedInMS / 3.6e6);
		const minutes = Math.floor((timeWorkedInMS % 3.6e6) / 6e4);
		const seconds = Math.floor((timeWorkedInMS % 6e4) / 1e3);

		return {
			timeWorked: `${hours}:${minutes}:${seconds}`,
			salary: employeeExists
				? (employeeExists.salaryPerHour * (timeWorkedInMS / 3.6e6)).toFixed(2)
				: undefined,
		};
	}
}
