import { Discord } from "discordx";
import { injectable } from "tsyringe";
import dayjs from "dayjs";
import { prisma } from "../main";
import { Exception } from "../helpers/Exception";
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

		const timeTrackingEntries = await prisma.timeEntry.findMany({
			where: {
				employeeId: employee.id,
				createdAt: {
					gte: startOfTheDay,
					lt: endOfTheDay,
				},
			},
		});

		const { duration: timeWorkedInMS } = timeTrackingEntries.reduce(
			(pTime, cTime) => ({
				duration: Number(pTime.duration) + Number(cTime.durationInMS),
			}),
			{ duration: 0 },
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
