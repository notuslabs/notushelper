import { ModelMessage, generateText } from "ai";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { openRouter } from "../main.js";

export class CreateSummaryUseCase {
	async execute(interaction: CommandInteraction) {
		if (!interaction.channel?.isTextBased()) return;

		const messages = await interaction.channel?.messages.fetch({
			limit: 100,
		});

		if (!messages) return;

		// Collect participants and build LLM messages
		const requesterDiscordId = interaction.user.id;
		const requesterUsername = interaction.user.username;
		let requesterMessageCount = 0;
		let requesterLatestTimestamp = 0;
		const participantIds = new Set<string>();
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
					"Inclua, se houver sinal claro, uma seção curta 'Sobre quem solicitou' (1–2 bullets) destacando a participação/impacto do solicitante sem centralizar o resumo nele.",
					"Se não houver informações relevantes sobre o solicitante, omita essa seção.",
					"Mantenha breve (≤ 12 tópicos). Evite citar trechos longos.",
					"Não inclua blocos de código. Não adicione título; a UI já fornece.",
					"Escreva em português do Brasil.",
				].join("\n"),
			},
		];

		for (const [, message] of messages) {
			if (message.author.bot) continue;
			participantIds.add(message.author.id);

			if (message.author.id === requesterDiscordId) {
				requesterMessageCount += 1;
				requesterLatestTimestamp = Math.max(
					requesterLatestTimestamp,
					message.createdTimestamp,
				);
			}

			allMessages.push({
				role: "user",
				content: `[${message.author.username}]: ${message.content}`,
			});
		}

		// Add requester context as a final system hint
		const requesterLastMessageHuman = requesterLatestTimestamp
			? new Date(requesterLatestTimestamp).toLocaleString("pt-BR")
			: "—";
		allMessages.unshift({
			role: "system",
			content: [
				`Solicitante: <@${requesterDiscordId}> (${requesterUsername})`,
				`Mensagens do solicitante: ${requesterMessageCount}`,
				`Última mensagem do solicitante: ${requesterLastMessageHuman}`,
			].join("\n"),
		});

		const response = await generateText({
			model: openRouter("@preset/notushelper"),
			messages: allMessages,
			maxOutputTokens: 400,
			temperature: 0.2,
		});

		// Build a nice embed for the summary
		const participantsMention = Array.from(participantIds)
			.map((id) => `<@${id}>`)
			.join(", ");

		const summaryEmbed = new EmbedBuilder()
			.setTitle("Resumo do canal")
			.setDescription(response.text.slice(0, 4000))
			.setColor("#fe9b69")
			.addFields(
				{
					name: "Solicitado por",
					value: `<@${requesterDiscordId}> • msgs: ${requesterMessageCount} • última: ${requesterLastMessageHuman}`,
					inline: false,
				},
				{
					name: "Participantes",
					value: participantsMention
						? participantsMention.slice(0, 1024)
						: "N/D",
					inline: false,
				},
				{
					name: "Mensagens analisadas",
					value: String(allMessages.length - 1),
					inline: true,
				},
			);

		await interaction.followUp({
			embeds: [summaryEmbed],
		});
	}
}
