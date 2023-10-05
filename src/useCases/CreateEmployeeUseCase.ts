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
        "Você já está registrado no sistema.",
        "user_already_registered"
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
