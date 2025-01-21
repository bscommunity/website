import { Injectable, inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { MatDialog } from "@angular/material/dialog";

import { UploadDialogSection1Component } from "./sections/section1.component";
import { UploadDialogSection2Component } from "./sections/section2.component";

import { Difficulty } from "@/lib/data";

export interface UploadFormData {
	contentType: string;
	title: string;
	artist: string;
	album: string;
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
			difficulty: Difficulty.Hard,
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

	private openCurrentStep() {
		const dialogRef = this.dialog.open<
			UploadDialogSection1Component | UploadDialogSection2Component
		>(this.getStepComponent(), {
			// width: "500px",
			disableClose: this.currentStepSubject.value === 0,
			data: this.formData,
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				// Update form data with result
				this.formData = { ...this.formData, ...result };

				// Move to next step
				const nextStep = this.currentStepSubject.value + 1;
				if (nextStep < this.getTotalSteps()) {
					this.currentStepSubject.next(nextStep);
					this.openCurrentStep();
				} else {
					this.submitForm();
					this.reset();
				}
			} else {
				this.reset();
			}
		});
	}

	private getStepComponent() {
		switch (this.currentStepSubject.value) {
			case 0:
				return UploadDialogSection1Component;
			case 1:
				return UploadDialogSection2Component;
			default:
				throw new Error("Invalid step");
		}
	}

	private getTotalSteps(): number {
		return 2;
	}

	private submitForm() {
		// Handle final form submission
		console.log("Form submitted:", this.formData);
	}
}
