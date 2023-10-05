import prettyMilliseconds from "pretty-ms";
import { client } from "../clients/clickup.js";
import { Exception } from "../helpers/Exception.js";
import { prisma } from "../main.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export type GetWorkStatsUseCaseInput = {
  discordUserId: string;
  month: number | undefined;
};

export class GetWorkStatsUseCase {
  async execute({
    discordUserId,
    month = dayjs().month(),
  }: GetWorkStatsUseCaseInput) {
    const employee = await prisma.employee.findUnique({
      where: { discordUserId: discordUserId },
    });

    if (!employee) {
      throw new Exception(
        "Você não está registrado no sistema. Use o comando `/setup init` para se registrar.",
        "user_not_registered"
      );
    }

    const firstDayOfTheMonth = dayjs
      .utc()
      .month(month)
      .startOf("month")
      .toDate();
    const lastDayOfTheMonth = dayjs.utc().month(month).endOf("month").toDate();

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

    const timeWorkedInMS = timeTrackingEntries.reduce(
      (pTime, cTime) => ({
        duration: Number(pTime.duration) + Number(cTime.duration),
      }),
      { duration: Math.abs(Number(currentTimeTracking?.duration ?? 0)) }
    );

    const timeWorkedInHours = timeWorkedInMS.duration / 3.6e6;

    const humanReadableTimeWorked = prettyMilliseconds(timeWorkedInMS.duration);

    return {
      humanReadableTimeWorked,
      salary: (employee.salaryPerHour * timeWorkedInHours).toFixed(2),
    };
  }
}
