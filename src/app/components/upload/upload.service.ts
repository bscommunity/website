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

import { Difficulty } from "@/models/enums/difficulty.enum";
import { getCoverArtUrl } from "@/lib/assets";

export interface UploadFormData {
	contentType: string;
	title: string;
	artist: string;
	album?: string;
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

export interface UploadErrorData {
	message: string;
	error: any;
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
		// Open loading dialog
		this.dialog.open(UploadDialogLoadingComponent, {
			disableClose: true,
			/* data: this.formData, */
		});

		let cover_url = null;

		// Handle cover art retrieval
		try {
			const { coverUrl, albumName } = await getCoverArtUrl(
				this.formData.artist,
				this.formData.title,
				this.formData.album,
			);
			cover_url = coverUrl;
			this.formData.album = albumName;
		} catch (error) {
			this.dialog.closeAll();

			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: "Failed to retrieve cover art.",
					error,
				},
			});

			return;
		}

		// Handle form submission
		// ...
		console.log("Form submitted:", this.formData);

		// Open success dialog
		this.dialog.closeAll();
		this.dialog.open(UploadDialogSuccessComponent, {
			disableClose: true,
			data: {
				id: "32a76726",
				title: this.formData.title,
				artist: this.formData.artist,
				difficulty: this.formData.difficulty,
				coverUrl: cover_url,
				duration: 653,
				notesAmount: 346,
				isDeluxe: this.formData.isDeluxe,
				isExplicit: this.formData.isExplicit,
			},
		});

		this.reset();
	}
}
