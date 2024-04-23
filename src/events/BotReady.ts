import { Discord, Once } from "discordx";

@Discord()
export class BotReady {
	@Once({ event: "ready" })
	async handle() {
		console.log("Bot Ready.");
	}
}
