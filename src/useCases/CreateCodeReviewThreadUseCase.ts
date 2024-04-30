import { injectable } from "tsyringe";
import { TextChannel, type Channel, type Message } from "discord.js";
import { Discord } from "discordx";
import { MaintainersRepository } from "../repositories/MaintainersRepository.js";
import { ProjectsRepository } from "../repositories/ProjectsRepository.js";
import { Exception } from "../helpers/Exception.js";

export type CreateCodeReviewThreadInput = {
	message: Message;
	channel: Channel;
};

@Discord()
@injectable()
export class CreateCodeReviewThreadUseCase {
	constructor(
		private maintainersRepository: MaintainersRepository,
		private projectsRepository: ProjectsRepository,
	) {}

	async execute({ channel, message }: CreateCodeReviewThreadInput) {
		if (!(channel instanceof TextChannel)) return;
		if (channel.id !== process.env.CODE_REVIEW_CHANNEL_ID) return;

		const allUrls = Array.from(
			message.content.matchAll(/(?<url>https?:\/\/[^\s]+)/g),
		).map((url) => new URL(url.groups?.url as string));

		const includesGithub = allUrls.find((url) =>
			url.hostname.includes("github.com"),
		);

		if (!includesGithub) return;
		const projectName = includesGithub.pathname.split("/")[2];
		const project = await this.projectsRepository.findProjectByName({
			name: projectName,
		});

		if (!project)
			throw new Exception(
				"I couldn't find anything about that project in my database! Is it new?",
				"PROJECT_NOT_FOUND",
			);

		const thread = await channel.threads.create({
			name: `Code review: ${message.author.username}`,
			startMessage: message,
		});

		const mentionedReviewers = Array.from(message.mentions.users.keys());
		const maintainerWithLeastReviews = [
			await this.maintainersRepository.findMaintainerWithLeastReviews({
				excludeMaintainers: [message.author.id],
			}),
		];

		maintainerWithLeastReviews.push(
			await this.maintainersRepository.findMaintainerByRoleWithLeastReviews({
				role: project.roleFocus,
				excludeMaintainers: [
					message.author.id,
					maintainerWithLeastReviews[0].discordUserId,
				],
			}),
		);

		let reviewers: string[] = [];

		switch (mentionedReviewers.length) {
			case 0: // no mentioned reviewers, let's choose the next two best reviewers
				reviewers = maintainerWithLeastReviews.map(
					(maintainer) => maintainer.discordUserId,
				);
				break;
			case 1: // one mentioned reviewer, let's choose one next best reviewer
				reviewers = [
					mentionedReviewers[0],
					maintainerWithLeastReviews[0].discordUserId,
				];
				break;
			default: // two or more mentioned reviewers, let's choose the mentioned reviewers
				reviewers = mentionedReviewers;
				break;
		}

		await this.maintainersRepository.increaseReviewCount({
			maintainersIds: reviewers,
		});

		const threadMessage = await thread.send({
			content: `Eu escolho vocês! ${reviewers
				.map((id) => `<@${id}>`)
				.join(", ")}!`,
			allowedMentions: {
				users: reviewers.filter((id) => !mentionedReviewers.includes(id)), // don't mention the mentioned reviewers
			},
		});

		await threadMessage.react("1232346477519437992"); // pokeball
	}
}
