import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";
import { GetReviewLeaderboardUseCase } from "../useCases/GetReviewLeaderboardUseCase.js";

@Discord()
@Guard(InteractionExceptionHandler(true))
@injectable()
export class GetReviewLeaderboardCommand {
	constructor(
		private getReviewLeaderboardUseCase: GetReviewLeaderboardUseCase,
	) {}

	@Slash({
		name: "review-leaderboard",
		description: "Shows the leaderboard of developers with most reviews",
	})
	async execute(interaction: CommandInteraction) {
		const leaderboard = await this.getReviewLeaderboardUseCase.execute();

		if (leaderboard.length === 0) {
			await interaction.followUp({
				content: "No developers found in the leaderboard.",
			});
			return;
		}

		const leaderboardEmbed = new EmbedBuilder()
			.setTitle("🏆 Code Review Leaderboard")
			.setDescription("Top reviewers ranked by number of code reviews")
			.setColor("#FFD700");

		const medals = ["🥇", "🥈", "🥉"];

		for (let i = 0; i < leaderboard.length; i++) {
			const developer = leaderboard[i];
			const medal = i < 3 ? medals[i] : `${i + 1}.`;
			const rolesText = developer.roles.join(", ");

			leaderboardEmbed.addFields({
				name: `${medal} ${developer.name}`,
				value: `<@${developer.discordUserId}>\n**Reviews:** ${developer.reviewCount}\n**Roles:** ${rolesText}`,
				inline: false,
			});
		}

		await interaction.followUp({
			embeds: [leaderboardEmbed],
		});
	}
}
