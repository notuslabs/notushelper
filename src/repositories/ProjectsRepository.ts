import { prisma } from "../main.js";

export type FindProjectByNameInput = {
	name: string;
};

export class ProjectsRepository {
	async findProjectByName({ name }: FindProjectByNameInput) {
		const project = await prisma.project.findFirst({
			where: {
				name,
			},
		});

		return project;
	}
}
