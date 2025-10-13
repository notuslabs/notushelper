import { z } from "zod";

const envVariables = z.object({
	BOT_TOKEN: z.string(),
	DATABASE_URL: z.string(),
	CODE_REVIEW_CHANNEL_ID: z.string(),
	OPENROUTER_API_KEY: z.string().optional(),
});

envVariables.parse(process.env);

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envVariables> {}
	}
}
