import { cva } from "class-variance-authority";

export const tourpassCover = cva(
	// Base classes
	"relative rounded-md overflow-hidden w-full aspect-video shrink-0 bg-surface-variant",

	{
		variants: {
			size: {
				sm: "h-20",
				md: "h-24",
			},
		},

		defaultVariants: {
			size: "md",
		},
	},
);
