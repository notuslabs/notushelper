import { Client } from "clickup.ts";

export const client = new Client({
	auth: { token: process.env.CLICKUP_TOKEN || "" },
});
