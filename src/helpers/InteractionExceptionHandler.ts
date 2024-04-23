import { ButtonInteraction, CommandInteraction } from "discord.js";
import { GuardFunction } from "discordx";

import { Exception } from "./Exception.js";

export const InteractionExceptionHandler: (
	ephemeral: boolean,
) => GuardFunction<CommandInteraction | ButtonInteraction> = (
	ephemeral: boolean,
) => {
	return async (interaction, client, next) => {
		await interaction.deferReply({ ephemeral });

		try {
			await next();
		} catch (err) {
			if (err instanceof Exception) {
				await interaction.followUp(err.message);
				return;
			}

			await interaction.followUp(`Unexpected error occurred. ${err}`);
		}
	};
};
