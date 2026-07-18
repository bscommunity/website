import { cva } from "class-variance-authority";

export const chartCover = cva(
	// Base classes
	"relative rounded-md overflow-hidden h-full aspect-square shrink-0 bg-surface-variant",

	{
		variants: {
			size: {
				sm: "w-16",
				md: "w-22",
			},
		},

		defaultVariants: {
			size: "md",
		},
	},
);
