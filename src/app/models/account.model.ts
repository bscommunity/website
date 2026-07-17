import { z } from "zod";

export const Account = z.object({
	id: z.string(),
	provider: z.string(),
	refreshToken: z.string().optional().nullable(),
	accessToken: z.string().optional().nullable(),
	expiresAt: z.coerce.date().optional().nullable(),
	tokenType: z.string().optional().nullable(),
	scope: z.string().optional().nullable(),
	idToken: z.string().optional().nullable(),
	sessionState: z.string().optional().nullable(),
});

export type AccountModel = z.infer<typeof Account>;
