import { Component } from "@angular/core";

import { MatSliderModule } from "@angular/material/slider";

const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

@Component({
	selector: "app-month-picker",
	templateUrl: "./month-picker.component.html",
	imports: [MatSliderModule],
})
export class MonthPickerComponent {
	initialDate = new Date(2021, 0, 1);
	finalDate = new Date(2022, 11, 31);

	rangeMonthsAmount =
		(this.finalDate.getFullYear() - this.initialDate.getFullYear()) * 12 +
		this.finalDate.getMonth() -
		this.initialDate.getMonth() +
		1;

	formatLabel(value: number): string {
		// Each month is a step
		/* console.log(value);
		console.log("initialDate: " + this.initialDate);
		console.log("rangeMonthsAmount: " + this.rangeMonthsAmount); */

		const year = Math.floor(value / 12) + this.initialDate.getFullYear();
		const month = value % 12;
		return `${months[month]} ${year}`;
	}
}
