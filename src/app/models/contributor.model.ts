import { z } from "zod";
import { SimplifiedUser } from "./user.model";
import { ContributorRole } from "./enums/role.enum";

export const Contributor = z.object({
	user: SimplifiedUser,
	roles: z.nativeEnum(ContributorRole).array(),
	joinedAt: z.coerce.date(),
});

export type ContributorModel = z.infer<typeof Contributor>;

export const SimplifiedContributor = z.object({
	userId: z.string(),
	roles: z.nativeEnum(ContributorRole).array(),
});

export type SimplifiedContributorModel = z.infer<typeof SimplifiedContributor>;
