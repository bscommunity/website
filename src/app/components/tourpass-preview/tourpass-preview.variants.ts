import { cva } from "class-variance-authority";

export const tourpassPreview = cva(
	// Base classes
	"flex flex-col items-center justify-center group relative border",

	{
		variants: {
			variant: {
				default:
					"bg-surface-container hover:bg-surface-container-low transition-colors duration-75 border-outline-variant/50 text-on-surface cursor-pointer",

				static: "bg-surface-container text-on-surface border-outline-variant/50",

				selected:
					"bg-primary-container text-on-primary-container border-transparent",
			},

			size: {
				sm: "p-4 gap-4 rounded-lg",
				md: "p-4 gap-6 rounded-xl",
				lg: "p-4 gap-6 rounded-2xl",
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
