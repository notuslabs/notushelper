import { z } from "zod";

const envVariables = z.object({
	CLICKUP_TEAM_ID: z.string(),
	CLICKUP_TOKEN: z.string(),
	BOT_TOKEN: z.string(),
	ALLOWED_SALARY_REQUESTERS_IDS: z.string(),
	CODE_REVIEW_CHANNEL_ID: z.string(),
	TRANSFERO_CLIENT_ID: z.string(),
	TRANSFERO_CLIENT_SECRET: z.string(),
	TRANSFERO_SCOPE: z.string(),
});

envVariables.parse(process.env);

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envVariables> {}
	}
}
