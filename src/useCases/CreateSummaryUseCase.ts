import { type ModelMessage, generateText } from "ai";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Exception } from "../helpers/Exception";
import { openRouter } from "../main";

export class CreateSummaryUseCase {
	async execute(interaction: CommandInteraction) {
		if (!interaction.channel?.isTextBased()) return;

		const messages = await interaction.channel?.messages.fetch({
			limit: 100,
		});

		if (!messages)
			throw new Exception("No messages found", "CreateSummaryUseCase");

		// Collect participants and build LLM messages
		const requesterUsername = interaction.user.username;
		const allMessages: ModelMessage[] = [
			{
				role: "system",
				content: [
					"Você é um assistente que escreve resumos concisos de canais no Discord.",
					"Resuma as últimas 100 mensagens de humanos em markdown claro e escaneável.",
					"Foque em:",
					"- Principais tópicos e decisões",
					"- Ações (com responsáveis, se mencionados)",
					"- Impedimentos ou dúvidas em aberto",
					"Mantenha breve (≤ 12 tópicos). Evite citar trechos longos.",
					"Não inclua blocos de código. Não adicione título; a UI já fornece.",
					"Escreva em português do Brasil.",

					`Solicitante: ${requesterUsername}`,
				].join("\n"),
			},
		];

		for (const [, message] of messages) {
			if (message.author.bot) continue;

			allMessages.push({
				role: "user",
				content: `[${message.author.username}]: ${message.content}`,
			});
		}

		const response = await generateText({
			model: openRouter("@preset/notushelper"),
			messages: allMessages,
			maxOutputTokens: 1024,
			temperature: 0.2,
		});

		// Build a nice embed for the summary
		const summaryEmbed = new EmbedBuilder()
			.setTitle("Resumo das últimas 100 mensagens")
			.setDescription(response.text.slice(0, 4000))
			.setColor("#fe9b69")
			.setFooter({
				text: `Solicitado por ${requesterUsername}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		await interaction.followUp({
			embeds: [summaryEmbed],
		});
	}
}
