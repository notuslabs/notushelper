import { generateText } from "ai";
import {
	EmbedBuilder,
	ForumChannel,
	Guild,
	GuildMember,
	ModalSubmitInteraction,
} from "discord.js";
import { Discord, Guard, ModalComponent } from "discordx";
import { Exception } from "../helpers/Exception";
import { InteractionExceptionHandler } from "../helpers/InteractionExceptionHandler";
import { openRouter, prisma } from "../main";

@Discord()
@Guard(InteractionExceptionHandler(true))
export class CreateQAModal {
	@ModalComponent({ id: "create-qa-modal" })
	async handle(interaction: ModalSubmitInteraction) {
		const qaForumChannelId = process.env.QA_FORUM_CHANNEL_ID;

		if (!qaForumChannelId) {
			throw new Exception("QA_FORUM_CHANNEL_ID not set", "CREATE_QA_MODAL");
		}

		if (!interaction.guild) {
			throw new Exception("Guild not found", "CREATE_QA_MODAL");
		}

		const qaForumChannel =
			await interaction.client.channels.fetch(qaForumChannelId);

		if (!(qaForumChannel instanceof ForumChannel)) {
			throw new Exception(
				"QA_FORUM_CHANNEL_ID is not a text channel",
				"CREATE_QA_MODAL",
			);
		}

		const whatToTest = interaction.fields.getTextInputValue("qa-what-to-test");
		const appleVersion =
			interaction.fields.getTextInputValue("qa-apple-version");
		const noteForReviewers = interaction.fields.getTextInputValue(
			"qa-note-for-reviewers",
		);

		// Android can be either a link (text input) or file upload depending on Nitro status
		let androidLink: string | null = null;
		let androidFile = null;

		try {
			androidLink = interaction.fields.getTextInputValue("qa-android-link");
		} catch {
			// User has Nitro, so they uploaded a file instead
			androidFile = interaction.fields
				.getUploadedFiles("qa-android-file")
				?.at(0)?.url;
		}

		const [title, selectedReviewers] = await Promise.all([
			this.generateTitle(whatToTest),
			this.selectReviewers(interaction.guild, { android: 2, apple: 1 }),
		]);

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(whatToTest)
			.setColor("#5865F2")
			.addFields(
				{
					name: "Android",
					value:
						androidLink ??
						(androidFile ? "Arquivo enviado" : "Link não fornecido"),
					inline: true,
				},
				{
					name: "TestFlight",
					value: appleVersion,
					inline: true,
				},
			)
			.setAuthor({
				name: interaction.user.displayName,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setTimestamp();

		if (noteForReviewers) {
			embed.addFields({
				name: "Nota para revisores",
				value: noteForReviewers,
			});
		}

		const reviewerMentions = [
			...selectedReviewers.android.map((m) => `<@${m.id}> (Android)`),
			...selectedReviewers.apple.map((m) => `<@${m.id}> (Apple)`),
		].join("\n");

		embed.addFields({
			name: "Revisores",
			value: reviewerMentions || "Nenhum revisor disponível",
		});

		const thread = await qaForumChannel.threads.create({
			name: title,
			message: {
				content: `Eu escolho vocês! ${reviewerMentions}!`,
				embeds: [embed],
			},
		});

		await interaction.followUp({
			content: `QA criado com sucesso! ${thread.url}`,
			ephemeral: true,
		});
	}

	private async getQAReviewers(guild: Guild): Promise<{
		appleMembers: GuildMember[];
		androidMembers: GuildMember[];
	}> {
		const members = await guild.members.fetch();

		const appleRole = guild.roles.cache.find((r) => r.name === "Apple");
		const androidRole = guild.roles.cache.find((r) => r.name === "Android");

		const appleMembers = appleRole
			? members.filter((m) => m.roles.cache.has(appleRole.id)).map((m) => m)
			: [];

		const androidMembers = androidRole
			? members.filter((m) => m.roles.cache.has(androidRole.id)).map((m) => m)
			: [];

		return { appleMembers, androidMembers };
	}

	/**
	 * Selects reviewers using a least-recently-selected algorithm.
	 * Members with the lowest review count are prioritized.
	 * When counts are equal, a random selection is made.
	 */
	private async selectReviewers(
		guild: Guild,
		count: { android: number; apple: number },
	): Promise<{ android: GuildMember[]; apple: GuildMember[] }> {
		const { appleMembers, androidMembers } = await this.getQAReviewers(guild);

		const selectFromPool = async (
			members: GuildMember[],
			platform: string,
			needed: number,
		): Promise<GuildMember[]> => {
			if (members.length === 0) return [];

			// Ensure all members exist in the database
			for (const member of members) {
				await prisma.qAReviewer.upsert({
					where: { discordUserId: member.id },
					update: {},
					create: {
						discordUserId: member.id,
						platform,
						reviewCount: 0,
					},
				});
			}

			// Get review counts from database
			const reviewers = await prisma.qAReviewer.findMany({
				where: {
					discordUserId: { in: members.map((m) => m.id) },
					platform,
				},
				orderBy: { reviewCount: "asc" },
			});

			// Select members with lowest counts
			const selected: GuildMember[] = [];
			const minCount = reviewers[0]?.reviewCount ?? 0;

			// Get all members with the minimum count
			const eligibleReviewers = reviewers.filter(
				(r) => r.reviewCount === minCount,
			);

			// Shuffle and pick needed amount
			const shuffled = eligibleReviewers.sort(() => Math.random() - 0.5);
			const toSelect = shuffled.slice(0, needed);

			for (const reviewer of toSelect) {
				const member = members.find((m) => m.id === reviewer.discordUserId);
				if (member) {
					selected.push(member);
					// Increment review count
					await prisma.qAReviewer.update({
						where: { discordUserId: member.id },
						data: { reviewCount: { increment: 1 } },
					});
				}
			}

			// If we still need more, pick from remaining (higher counts)
			if (selected.length < needed) {
				const remaining = reviewers
					.filter((r) => !toSelect.includes(r))
					.slice(0, needed - selected.length);

				for (const reviewer of remaining) {
					const member = members.find((m) => m.id === reviewer.discordUserId);
					if (member) {
						selected.push(member);
						await prisma.qAReviewer.update({
							where: { discordUserId: member.id },
							data: { reviewCount: { increment: 1 } },
						});
					}
				}
			}

			return selected;
		};

		const [android, apple] = await Promise.all([
			selectFromPool(androidMembers, "android", count.android),
			selectFromPool(appleMembers, "apple", count.apple),
		]);

		return { android, apple };
	}

	private async generateTitle(whatToTest: string): Promise<string> {
		const response = await generateText({
			model: openRouter("@preset/notushelper"),
			messages: [
				{
					role: "system",
					content:
						"Gere um título curto e descritivo (máximo 50 caracteres) para um QA baseado na descrição. Responda apenas com o título, sem aspas ou formatação.",
				},
				{
					role: "user",
					content: whatToTest,
				},
			],
			maxOutputTokens: 30,
			temperature: 0.3,
		});

		return response.text.slice(0, 100);
	}
}
