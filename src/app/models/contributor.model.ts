import { z } from "zod";
import { ContributorUser } from "./user.model";
import { Role } from "./enums/role.enum";

export const Contributor = z.object({
	user: ContributorUser,
	roles: z.nativeEnum(Role).array(),
	joinedAt: z.coerce.date(),
});

export type ContributorModel = z.infer<typeof Contributor>;
