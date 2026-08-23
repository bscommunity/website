import { cva } from "class-variance-authority";

export const themeArt = cva(
	// Base classes
	"relative flex flex-row items-end justify-center w-full",
);

export const themeDisplayArt = cva(
	// Base classes
	"object-fit rounded-md mb-2 border-3 border-secondary-container aspect-9/16",

	{
		variants: {
			size: {
				sm: "w-20 xl:w-24",
				md: "w-28 xl:w-32",
				lg: "w-full border-4 mb-6",
			},
		},

		defaultVariants: {
			size: "md",
		},
	},
);

export const themeArtCover = cva(
	// Base classes
	"object-fit rounded-md border-3 border-secondary-container aspect-square",

	{
		variants: {
			size: {
				sm: "w-14 h-14 xl:w-16 xl:h-16 -ml-5",
				md: "w-18 h-18 xl:w-20 xl:h-20 -ml-6",
				lg: "w-36 h-36 -ml-16 border-4",
			},
		},

		defaultVariants: {
			size: "md",
		},
	},
);
