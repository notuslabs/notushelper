import "dotenv/config";
import "reflect-metadata";
import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";

import { container } from "tsyringe";
import { DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { PrismaClient } from "@prisma/client";

DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

export const prisma = new PrismaClient();
export const reviewers = {
	reviewers: [
		"692404092756164668",
		"818959779326197841",
		"195746220902187008",
		"522095646061363212",
		"378956057180897292",
		"321177932959711232",
	],
	currentViewer: 0,
	next(userId?: string): string {
		if (this.currentViewer >= this.reviewers.length) {
			this.currentViewer = 0;
		}

		const nextReviewer = this.reviewers[this.currentViewer++];

		if (userId && userId === nextReviewer) return this.next(userId);

		return nextReviewer;
	},
};

export const bot = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.MessageContent,
	],

	silent: false,
});

bot.once("ready", async () => {
	await bot.initApplicationCommands();

	console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
	bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
	bot.executeCommand(message);
});

async function run() {
	await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

	if (!process.env.BOT_TOKEN) {
		throw Error("Could not find BOT_TOKEN in your environment");
	}

	await bot.login(process.env.BOT_TOKEN);
}

run();
