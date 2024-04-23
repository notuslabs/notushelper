import { Discord } from "discordx";
import { injectable } from "tsyringe";
import { client } from "../clients/clickup.js";
import dayjs from "dayjs";
import { prisma } from "../main.js";
import { Exception } from "../helpers/Exception.js";
import prettyMilliseconds from "pretty-ms";

export type GetDailyWorkStatsUseCaseInput = {
	discordUserId: string;
};

@Discord()
@injectable()
export class GetDailyWorkStatsUseCase {
	async execute({ discordUserId }: GetDailyWorkStatsUseCaseInput) {
		const employee = await prisma.employee.findUnique({
			where: { discordUserId },
		});

		if (!employee) {
			throw new Exception(
				"You're not in the system. Please use the `/setup init` command.",
				"employee_not_found",
			);
		}

		const startOfTheDay = dayjs().startOf("day").toDate();
		const endOfTheDay = dayjs().endOf("day").toDate();

		const [timeTrackingEntries, currentTimeTracking] = await Promise.all([
			await client.timeTracking.getTimeTrackingEntries({
				teamId: process.env.CLICKUP_TEAM_ID || "",
				startDate: startOfTheDay.getTime(),
				endDate: endOfTheDay.getTime(),
				assignee: employee.clickUpUserId.toString(),
			}),
			await client.timeTracking.getTimeTrackingRunning({
				teamId: process.env.CLICKUP_TEAM_ID || "",
				assignee: employee.clickUpUserId.toString(),
			}),
		]);

		const { duration: timeWorkedInMS } = timeTrackingEntries.reduce(
			(pTime, cTime) => ({
				duration: Number(pTime.duration) + Number(cTime.duration),
			}),
			{ duration: Math.abs(Number(currentTimeTracking?.duration ?? 0)) },
		);

		const workloadInMS = employee.workloadPerDay * 60 * 60 * 1000;

		const finishWorkAtMS = workloadInMS - timeWorkedInMS;

		let finishWorkAt: string;
		if (finishWorkAtMS < 0) {
			finishWorkAt = "You're done for today!";
		} else {
			finishWorkAt = `${dayjs()
				.add(workloadInMS - timeWorkedInMS, "ms")
				.format("HH:mm")}`;
		}

		return {
			employee,
			hoursWorked: timeWorkedInMS / 1000 / 60 / 60,
			timeWorkedHumanReadable: prettyMilliseconds(timeWorkedInMS),
			finishWorkAt,
		};
	}
}
