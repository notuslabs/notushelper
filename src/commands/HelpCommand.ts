import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { bot } from "../main.js";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler.js";

@Discord()
@Guard(InteractionExceptionHandler(false))
@injectable()
export class HelpCommand {
	@Slash({
		name: "help",
		description: "Get help",
	})
	async execute(interaction: CommandInteraction) {
		const helpEmbed = new EmbedBuilder();
		helpEmbed.setTitle("Help");
		helpEmbed.setDescription("This is the help command");
		helpEmbed.setColor("#fe9b69");

		const allCommands = bot.applicationCommands
			.map((command) => {
				return `/${command.name} - ${command.description}`;
			})
			.join("\n");

		helpEmbed.setDescription(allCommands);

		await interaction.followUp({
			content:
				"My code is available at <https://github.com/notuslabs/notushelper>",
			embeds: [helpEmbed],
		});
	}
}
