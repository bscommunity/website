import { Injectable, inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { MatDialog } from "@angular/material/dialog";

import { UploadDialogSection1Component } from "./sections/section1.component";
import { UploadDialogSection2Component } from "./sections/section2.component";
import { UploadDialogSection3Component } from "./sections/section3.component";
import { UploadDialogDisclaimerComponent } from "./generic/disclaimer.component";
import { UploadDialogLoadingComponent } from "./generic/loading.component";

const stepComponents = [
	UploadDialogSection1Component,
	UploadDialogSection2Component,
	UploadDialogSection3Component,
	UploadDialogDisclaimerComponent,
];
type StepComponentInstanceType = (typeof stepComponents)[number] extends new (
	...args: any[]
) => infer R
	? R
	: never;

import { Difficulty } from "@/lib/data";

export interface UploadFormData {
	contentType: string;
	title: string;
	artist: string;
	album: string;
	chart_url: string;
	difficulty: Difficulty;
	isDeluxe: boolean;
}

@Injectable({
	providedIn: "root",
})
export class UploadDialogService {
	private dialog = inject(MatDialog);

	// Track the current step
	private currentStepSubject = new BehaviorSubject<number>(0);
	currentStep$ = this.currentStepSubject.asObservable();

	private getInitialFormData(): UploadFormData {
		return {
			contentType: "",
			title: "",
			artist: "",
			album: "",
			chart_url: "",
			difficulty: Difficulty.Normal,
			isDeluxe: false,
			// ... other initial values
		};
	}

	// Store form data
	private formData: UploadFormData = this.getInitialFormData();

	open() {
		this.currentStepSubject.next(0);
		this.openCurrentStep();
	}

	private reset() {
		this.currentStepSubject.next(0);
		this.formData = this.getInitialFormData();
	}

	private moveToNextStep() {
		const nextStep = this.currentStepSubject.value + 1;
		if (nextStep < this.getTotalSteps()) {
			this.currentStepSubject.next(nextStep);
			this.openCurrentStep();
		} else {
			this.submitForm();
			this.reset();
		}
	}

	private openCurrentStep() {
		const dialogRef = this.dialog.open<StepComponentInstanceType>(
			this.getStepComponent(),
			{
				// width: "500px",
				disableClose: this.currentStepSubject.value !== 0,
				data: this.formData,
			},
		);

		dialogRef.afterClosed().subscribe((result) => {
			if (result === "back") {
				// Go back to previous step
				const previousStep = this.currentStepSubject.value - 1;
				this.currentStepSubject.next(previousStep);
				this.openCurrentStep();
			} else if (result === "next") {
				// Move to next step
				this.moveToNextStep();
			} else if (result) {
				// Update form data with result
				this.formData = { ...this.formData, ...result };

				// Move to next step
				this.moveToNextStep();
			} else {
				this.reset();
			}
		});
	}

	private getStepComponent() {
		if (this.currentStepSubject.value >= stepComponents.length)
			throw new Error("Invalid step");
		return stepComponents[this.currentStepSubject.value];
	}

	private getTotalSteps(): number {
		return stepComponents.length;
	}

	private submitForm() {
		// Handle final form submission
		console.log("Form submitted:", this.formData);

		// Open loading dialog
		this.dialog.open(UploadDialogLoadingComponent, {
			disableClose: true,
			data: this.formData,
		});

		// Simulate a delay
		setTimeout(() => {
			this.dialog.closeAll();
		}, 2000);

		// Handle form submission
		// ...
	}
}
