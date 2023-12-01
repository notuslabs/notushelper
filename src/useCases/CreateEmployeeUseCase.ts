import { injectable } from "tsyringe";
import { prisma } from "../main.js";
import { Exception } from "../helpers/Exception.js";

export type SetupUseCaseInput = {
  username: string;
  discordUserId: string;
  salaryPerHour: number;
  workloadPerDay: number;
  clickUpUserId: number;
};

@injectable()
export class CreateEmployeeUseCase {
  async execute({
    clickUpUserId,
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
        "employee_already_exists"
      );
    }

    const employeeWithSameClickUpId = await prisma.employee.findUnique({
      where: { clickUpUserId },
    });

    if (employeeWithSameClickUpId) {
      throw new Exception(
        `The employee <@${employeeWithSameClickUpId.discordUserId}> is already using the ClickUp user you provided.`,
        "clickup_id_already_exists"
      );
    }

    const employee = await prisma.employee.create({
      data: {
        discordUserId,
        salaryPerHour,
        workloadPerDay,
        clickUpUserId,
        name: username,
      },
    });

    return employee;
  }
}
