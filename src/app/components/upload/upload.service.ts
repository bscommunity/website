import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
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

// Lib
import { getMediaInfo } from "@/lib/assets";

// Services
import { ChartService } from "@/services/api/chart.service";
import { ChartFileData } from "@/services/decode.service";
import { AuthService } from "app/auth/auth.service";

// Models
import { ChartModel, CreateChartModel } from "@/models/chart.model";
import { Difficulty } from "@/models/enums/difficulty.enum";

export type UploadFormData = CreateChartModel & {
	contentType: string; // Omitted when submitting
	chartUrl: string;
	chartFileData: ChartFileData | null;
};

export interface UploadErrorData {
	title?: string | null;
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
	chartFileData: null,
	//
	track: "",
	artist: "",
	album: "",
	coverUrl: "",
	difficulty: Difficulty.Normal,
	isDeluxe: false,
	isExplicit: false,
	//
	duration: 0,
	notesAmount: 0,
	bpm: 0,
	effectsAmount: 0,
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
				/* this.reset(); */
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
		// Check if user is logged in
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
		this.dialog.open(UploadDialogLoadingComponent, { disableClose: true });

		// Handle track data retrieval (cover art, track and artist names confirmation)
		try {
			const { coverUrl, album, artist, track } = await getMediaInfo(
				this.formData.track,
				this.formData.artist,
			);

			this.formData.coverUrl = coverUrl;

			if (album) {
				this.formData.album = album;
			}

			if (artist) {
				this.formData.artist = artist;
			}

			if (track) {
				this.formData.track = track;
			}
		} catch (error) {
			this.dialog.closeAll();
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: "Failed to retrieve cover art.",
					error,
				},
			});
			/* this.reset(); */

			return;
		}

		// Handle chart data submission (basic and first version creation)
		const { contentType, chartFileData, ...rest } = this.formData;

		const data: CreateChartModel = {
			...rest,
			...chartFileData,
		};

		console.log("Form submitted with the following data:", data);

		// Submit chart data
		try {
			const response = await this.chartService.createChart(data);
			console.log("Chart submitted successfully:", response);

			if (!response) {
				this.dialog.open(UploadDialogErrorComponent, {
					data: {
						message: "Failed to submit chart.",
						error: null,
					},
				});

				/* this.reset(); */
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
					coverUrl: response.coverUrl,
					duration: response.versions[0].duration,
					notesAmount: response.versions[0].notesAmount,
					isDeluxe: response.isDeluxe,
					isExplicit: response.isExplicit,
				},
			});
		} catch (error) {
			console.error("Failed to submit chart:", error);

			this.dialog.closeAll();
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					title: "Failed to submit chart.",
					error,
				},
			});
		}

		/* this.reset(); */
	}
}
