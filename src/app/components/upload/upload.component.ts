import { Injectable, inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { MatDialog } from "@angular/material/dialog";

import { UploadDialogSection1Component } from "./sections/section1.component";
import { UploadDialogSection2Component } from "./sections/section2.component";
import { UploadDialogSection3Component } from "./sections/section3.component";

import { UploadDialogDisclaimerComponent } from "./generic/disclaimer.component";
import { UploadDialogLoadingComponent } from "./generic/loading.component";
import { UploadDialogSuccessComponent } from "./generic/success.component";
import { UploadDialogErrorComponent } from "./generic/error.component";

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
	chartUrl: string;
	difficulty: Difficulty;
	isDeluxe: boolean;
	isExplicit: boolean;
}

export interface UploadSuccessData {
	id: string;
	title: string;
	artist: string;
	difficulty: Difficulty;
	coverUrl: string;
	duration: number;
	notesAmount: number;
	isDeluxe: boolean;
	isExplicit: boolean;
}

export const initialFormData: UploadFormData = {
	contentType: "",
	title: "",
	artist: "",
	album: "",
	chartUrl: "",
	difficulty: Difficulty.Normal,
	isDeluxe: false,
	isExplicit: false,
	// ... other initial values
};

@Injectable({
	providedIn: "root",
})
export class UploadDialogService {
	private dialog = inject(MatDialog);

	// Track the current step
	private currentStepSubject = new BehaviorSubject<number>(0);
	currentStep$ = this.currentStepSubject.asObservable();

	// Store form data
	private formData: UploadFormData = initialFormData;

	open() {
		this.currentStepSubject.next(0);
		this.openCurrentStep();
	}

	private reset() {
		this.currentStepSubject.next(0);
		this.formData = initialFormData;
	}

	private moveToNextStep() {
		const nextStep = this.currentStepSubject.value + 1;
		if (nextStep < this.getTotalSteps()) {
			this.currentStepSubject.next(nextStep);
			this.openCurrentStep();
		} else {
			this.submitForm();
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

	private async submitForm() {
		// Handle final form submission
		console.log("Form submitted:", this.formData);

		// Open loading dialog
		this.dialog.open(UploadDialogLoadingComponent, {
			disableClose: true,
			/* data: this.formData, */
		});

		// Simulate a delay
		const promise = new Promise((resolve) => {
			setTimeout(resolve, 3000);
		});

		await promise;

		this.dialog.closeAll();

		// Handle form submission
		// ...

		console.log("Form submitted after all:", this.formData);

		// Open success dialog
		this.dialog.open(UploadDialogSuccessComponent, {
			disableClose: true,
			data: {
				id: "32a76726",
				title: this.formData.title,
				artist: this.formData.artist,
				difficulty: this.formData.difficulty,
				coverUrl:
					"https://i0.wp.com/lyricsfa.com/wp-content/uploads/2018/10/The-Prodigy-Lyrics.jpg",
				duration: 653,
				notesAmount: 346,
				isDeluxe: this.formData.isDeluxe,
				isExplicit: this.formData.isExplicit,
			},
		});

		this.reset();

		/* 
		this.dialog.open(UploadDialogErrorComponent);
		*/
	}
}
