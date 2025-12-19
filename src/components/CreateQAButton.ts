import {
	ButtonInteraction,
	FileUploadBuilder,
	LabelBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { ButtonComponent, Discord } from "discordx";

@Discord()
export class CreateQAButton {
	@ButtonComponent({ id: "create-qa-button" })
	async handle(interaction: ButtonInteraction) {
		const user = await interaction.user.fetch();
		// Check for Nitro by looking for animated avatar or banner (Nitro-exclusive features)
		const hasNitro = user.avatar?.startsWith("a_") || user.banner !== null;

		const whatToTestInput = new TextInputBuilder()
			.setCustomId("qa-what-to-test")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("Descreva o que deve ser testado");

		const whatToTestLabel = new LabelBuilder()
			.setLabel("O que testar")
			.setTextInputComponent(whatToTestInput);

		let androidLabel: LabelBuilder;
		if (hasNitro) {
			const androidFileUpload = new FileUploadBuilder()
				.setCustomId("qa-android-file")
				.setRequired(true);

			androidLabel = new LabelBuilder()
				.setLabel("APK Android")
				.setFileUploadComponent(androidFileUpload);
		} else {
			const androidLinkInput = new TextInputBuilder()
				.setCustomId("qa-android-link")
				.setStyle(TextInputStyle.Short)
				.setPlaceholder("https://...");

			androidLabel = new LabelBuilder()
				.setLabel("Link Android")
				.setTextInputComponent(androidLinkInput);
		}

		const appleVersionInput = new TextInputBuilder()
			.setCustomId("qa-apple-version")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Ex: 1.0.0 (123)");

		const appleVersionLabel = new LabelBuilder()
			.setLabel("Versão TestFlight (Apple)")
			.setTextInputComponent(appleVersionInput);

		const noteForReviewersInput = new TextInputBuilder()
			.setCustomId("qa-note-for-reviewers")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("Observações adicionais para os revisores")
			.setRequired(false);

		const noteForReviewersLabel = new LabelBuilder()
			.setLabel("Nota para revisores")
			.setTextInputComponent(noteForReviewersInput);

		const modal = new ModalBuilder()
			.setCustomId("create-qa-modal")
			.setTitle("Criar QA")
			.addLabelComponents(
				whatToTestLabel,
				androidLabel,
				appleVersionLabel,
				noteForReviewersLabel,
			);

		await interaction.showModal(modal);
	}
}
