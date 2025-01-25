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
import { AuthService } from "app/auth/auth.service";
import { Router } from "@angular/router";
import { ChartModel, MutateChartModel } from "@/models/chart.model";
import { ChartService } from "@/services/api/chart.service";

export type UploadFormData = MutateChartModel & {
	// Form data
	contentType: string;
	chartUrl: string;
	album?: string;
};

export interface UploadErrorData {
	message: string;
	error: any;
	redirectTo?: string;
}

export type SuccessDialogData = ChartModel & {
	notesAmount: number;
	duration: number;
};

export const initialFormData: UploadFormData = {
	contentType: "",
	chartUrl: "",
	album: "",
	//
	track: "",
	artist: "",
	coverUrl: "",
	difficulty: Difficulty.Normal,
	isDeluxe: false,
	isExplicit: false,
	// ... any other initial values added later
};

@Injectable({
	providedIn: "root",
})
export class UploadDialogService {
	private router = inject(Router);
	private dialog = inject(MatDialog);

	private chartService = inject(ChartService);
	private authService = inject(AuthService);

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
		if (!this.authService.isLoggedIn()) {
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: "You must be logged in to submit content.",
					error: null,
				},
			});
			this.router.navigate(["/login"]);
			return;
		}

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
				this.formData.track,
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

		try {
			const response = await this.chartService.createChart({
				...this.formData,
				coverUrl: cover_url,
			});

			if (!response) {
				this.dialog.open(UploadDialogErrorComponent, {
					data: {
						message: "Failed to submit chart.",
						error: null,
					},
				});
				return;
			}

			// Open success dialog
			this.dialog.closeAll();
			this.dialog.open(UploadDialogSuccessComponent, {
				disableClose: true,
				data: {
					id: response.id,
					track: response.track,
					artist: response.artist,
					difficulty: response.difficulty,
					coverUrl: cover_url,
					duration: response.versions[0].duration,
					notesAmount: response.versions[0].notesAmount,
					isDeluxe: response.isDeluxe,
					isExplicit: response.isExplicit,
				},
			});

			this.reset();
		} catch (error) {
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: "Failed to submit chart.",
					error,
				},
			});
		}
	}
}
