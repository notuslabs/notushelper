import { injectable } from "tsyringe";
import { prisma } from "../main.js";
import { Discord } from "discordx";
import { GetMonthlyStatsUseCase } from "./GetMonthlyStatsUseCase.js";
import dayjs from "dayjs";
import { Exception } from "../helpers/Exception.js";

export type GetAllEmployeesSalaryUseCaseInput = {
  month?: number;
  requestBy: string;
};

@Discord()
@injectable()
export class GetAllEmployeesSalaryUseCase {
  constructor(private getMonthlyStatsUseCase: GetMonthlyStatsUseCase) {}

  async execute({
    month = dayjs().subtract(1, "month").month(),
    requestBy,
  }: GetAllEmployeesSalaryUseCaseInput) {
    if (
      !process.env.ALLOWED_SALARY_REQUESTERS_IDS?.split(",").includes(requestBy)
    )
      throw new Exception(
        "You're not allowed to request this information",
        "not_allowed"
      );

    const employees = await prisma.employee.findMany();

    const stats = [];

    for (const employee of employees) {
      const { salary, timeWorked } = await this.getMonthlyStatsUseCase.execute({
        discordUserId: employee.discordUserId,
        month,
      });

      stats.push({
        name: employee.name,
        discordUserId: employee.discordUserId,
        salary,
        timeWorked,
      });
    }

    return stats;
  }
}
