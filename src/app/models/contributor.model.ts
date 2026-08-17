import { z } from "zod";
import { ContributorRole } from "./enums/role.enum";
import { SimplifiedUser } from "./user.model";

export const Contributor = z.object({
	user: SimplifiedUser,
	catalogItemId: z.string(),
	note: z.string().optional().nullable(),
	role: z.nativeEnum(ContributorRole),
	joinedAt: z.coerce.date(),
});

export type ContributorModel = z.infer<typeof Contributor>;

export const SimplifiedContributor = z.object({
	userId: z.string(),
	role: z.nativeEnum(ContributorRole),
});

export type SimplifiedContributorModel = z.infer<typeof SimplifiedContributor>;
