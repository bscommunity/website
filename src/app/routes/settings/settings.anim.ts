import {
	trigger,
	transition,
	style,
	animate,
	query,
	group,
} from "@angular/animations";

export const settingsAnim = trigger("tabSlide", [
	transition("* => account", [
		style({ position: "relative" }),
		query(
			":enter, :leave",
			[
				style({
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
				}),
			],
			{ optional: true },
		),
		query(
			":enter",
			[style({ transform: "translateX(-30px)", opacity: 0 })],
			{ optional: true },
		),
		group([
			query(
				":leave",
				[
					animate(
						"200ms ease",
						style({
							transform: "translateX(30px)",
							opacity: 0,
						}),
					),
				],
				{ optional: true },
			),
			query(
				":enter",
				[
					animate(
						"200ms ease",
						style({ transform: "none", opacity: 1 }),
					),
				],
				{ optional: true },
			),
		]),
	]),
	transition("* => connections", [
		style({ position: "relative" }),
		query(
			":enter, :leave",
			[
				style({
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
				}),
			],
			{ optional: true },
		),
		query(
			":enter",
			[style({ transform: "translateX(30px)", opacity: 0 })],
			{ optional: true },
		),
		group([
			query(
				":leave",
				[
					animate(
						"200ms ease",
						style({
							transform: "translateX(-30px)",
							opacity: 0,
						}),
					),
				],
				{ optional: true },
			),
			query(
				":enter",
				[
					animate(
						"200ms ease",
						style({ transform: "none", opacity: 1 }),
					),
				],
				{ optional: true },
			),
		]),
	]),
]);
