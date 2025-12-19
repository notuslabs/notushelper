import { Discord, Once } from "discordx";

@Discord()
export class BotReady {
	@Once({ event: "clientReady" })
	async handle() {
		console.log("Bot Ready.");
	}
}
