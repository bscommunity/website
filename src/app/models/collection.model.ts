import { z } from "zod";

// Enums
import { CollectionKind } from "./enums/collection-kind.enum";

// Models
import { SimplifiedUser } from "./user.model";

export const Collection = z.object({
	id: z.string(),
	userId: z.string(),
	kind: z.nativeEnum(CollectionKind),
	name: z.string(),
	slug: z.string().optional().nullable(),
	isPublic: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	coverUrl: z.string().optional().nullable(),
	chartCount: z.number().int(),
	tourPassCount: z.number().int(),
	themeCount: z.number().int(),
	owner: SimplifiedUser.optional().nullable(),
});

export type CollectionModel = z.infer<typeof Collection>;
