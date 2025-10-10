import "reflect-metadata";
import "dotenv/config";
import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import prettyMS from "pretty-ms";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { PrismaClient } from "@prisma/client";
import { DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { container } from "tsyringe";

DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

function computeDuration(startedAt: Date, endedAt: Date | null) {
	return endedAt
		? endedAt.getTime() - startedAt.getTime()
		: new Date().getTime() - startedAt.getTime();
}

export const prisma = new PrismaClient().$extends({
	result: {
		timeEntry: {
			durationInMS: {
				needs: { startedAt: true, endedAt: true },
				compute: (data) => computeDuration(data.startedAt, data.endedAt),
			},
			formattedDuration: {
				needs: { startedAt: true, endedAt: true },
				compute(data) {
					return prettyMS(computeDuration(data.startedAt, data.endedAt));
				},
			},
		},
	},
});

export const openRouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

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
