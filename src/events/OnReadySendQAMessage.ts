import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextChannel,
} from "discord.js";
import { Discord, Once } from "discordx";
import { bot } from "../main";

@Discord()
export class OnReadySendQAMessage {
	@Once({ event: "clientReady" })
	async handle() {
		const channelId = process.env.CREATE_QA_CHANNEL_ID;

		if (!channelId) {
			console.log("CREATE_QA_CHANNEL_ID not set, skipping QA message.");
			return;
		}

		const channel = await bot.channels.fetch(channelId);

		if (!(channel instanceof TextChannel)) {
			console.log("CREATE_QA_CHANNEL_ID is not a text channel.");
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle("Sistema de QA")
			.setDescription(
				"Use o botão abaixo para criar uma nova thread de QA. Compartilhe suas dúvidas, peça ajuda ou discuta problemas técnicos com a equipe.",
			)
			.setColor("#5865F2");

		const button = new ButtonBuilder()
			.setCustomId("create-qa-button")
			.setLabel("Criar QA")
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		const messages = await channel.messages.fetch({ limit: 50 });
		const existingMessage = messages.find(
			(msg) =>
				msg.author.id === bot.user?.id &&
				msg.embeds[0]?.title === "Sistema de QA",
		);

		if (existingMessage) {
			await existingMessage.delete();
		}

		await channel.send({
			embeds: [embed],
			components: [row],
		});
		console.log("QA message sent.");
	}
}
