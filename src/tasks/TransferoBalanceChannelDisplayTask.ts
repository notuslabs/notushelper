import { DisplayChannelType } from "@prisma/client";
import { TransferoClient } from "../helpers/TransferoClient.js";
import { bot, prisma } from "../main.js";
import { ChannelType } from "discord.js";

const transferoClient = new TransferoClient();

export async function TransferoBalanceChannelDisplayTask() {
	try {
		console.time("TransferoBalanceChannelDisplayTask");
		const balances = await transferoClient.getAllAccountBalances();

		let displayChannel = await prisma.displayChannel.findUnique({
			where: {
				type: DisplayChannelType.TRANFERO_BRL_BALANCE,
			},
		});

		if (!displayChannel) {
			const guild = await bot.guilds.fetch("1065415379620479046"); // not ideal but it works
			const channel = await guild.channels.create({
				name: `💰⛓️ R$${balances.reduce((acc, curr) => acc + curr.balance.amount, 0)}(Transfero)`,
				type: ChannelType.GuildVoice,
				parent: "1313333871453929502", // not ideal but it works
			});

			displayChannel = await prisma.displayChannel.create({
				data: {
					channelId: channel.id,
					categoryId: "1313333871453929502",
					type: DisplayChannelType.TRANFERO_BRL_BALANCE,
				},
			});
		}

		const channel = await bot.channels.fetch(displayChannel.channelId);

		if (!channel?.isVoiceBased()) {
			throw new Error("Channel is not voice based");
		}

		await channel.edit({
			name: `💰⛓️ R$${balances.reduce((acc, curr) => acc + curr.balance.amount, 0).toFixed(2)}(Transfero)`,
		});
	} catch (error) {
		console.error(error);
	} finally {
		console.timeEnd("TransferoBalanceChannelDisplayTask");
	}
}

TransferoBalanceChannelDisplayTask();
setInterval(TransferoBalanceChannelDisplayTask, 30 * 1000);
