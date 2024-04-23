import { injectable } from "tsyringe";
import { prisma } from "../main.js";

@injectable()
export class GetAllEmployeesUseCase {
	async execute() {
		const employees = await prisma.employee.findMany();

		return employees;
	}
}
