import { cva } from "class-variance-authority";

export const chartPreview = cva(
	// Base classes
	"flex flex-row items-start justify-center gap-4 cursor-pointer group relative",

	{
		variants: {
			variant: {
				default:
					"bg-surface-container hover:bg-surface-container-low transition-colors duration-75 border border-outline-variant/50 text-on-surface",

				selected: "bg-primary-container text-on-primary-container",
			},

			size: {
				sm: "p-4 rounded-lg",
				md: "p-4 rounded-xl",
				lg: "p-4 rounded-2xl",
			},

			fullWidth: {
				true: "w-full",
				false: "",
			},
		},

		defaultVariants: {
			variant: "default",
			size: "md",
			fullWidth: false,
		},
	},
);
