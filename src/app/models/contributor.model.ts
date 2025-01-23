import { z } from "zod";
import { User } from "./user.model";
import { Role } from "./enums/role.enum";

export const Contributor = z.object({
	user: User,
	roles: z.nativeEnum(Role).array(),
	joinedAt: z.coerce.date(),
});

export type ContributorModel = z.infer<typeof Contributor>;
