import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { MatDialog } from "@angular/material/dialog";

import { UploadDialogSection1Component } from "@/components/upload/sections/section1.component";
import { UploadDialogSection2Component } from "@/components/upload/sections/section2.component";
import { UploadDialogSection3Component } from "@/components/upload/sections/section3.component";

import { UploadDialogDisclaimerComponent } from "@/components/upload/generic/disclaimer.component";
import { UploadDialogLoadingComponent } from "@/components/upload/generic/loading.component";
import { UploadDialogSuccessComponent } from "@/components/upload/generic/success.component";
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";

export const uploadStepComponents = [
	UploadDialogSection1Component,
	UploadDialogSection2Component,
	UploadDialogSection3Component,
	UploadDialogDisclaimerComponent,
];
type StepComponentInstanceType =
	(typeof uploadStepComponents)[number] extends new (
		...args: any[]
	) => infer R
		? R
		: never;

// Lib
import { getMediaInfo, getTrackStreamingLinks } from "@/lib/assets";

// Services
import { ChartService } from "@/services/api/chart.service";
import { CacheService } from "@/services/cache.service";
import { CookieService } from "./cookie.service";
import { AuthService } from "app/auth/auth.service";

// Types
import type { ChartFileData } from "@/services/decode.service";

// Models
import { ChartModel, CreateChartModel } from "@/models/chart.model";
import { Difficulty } from "@/models/enums/difficulty.enum";

export type DialogData = {
	title?: string | null;
	description?: string | null;
	formData: UploadFormData;
	inactive: string[];
};

export type UploadFormData = CreateChartModel & {
	// Omitted when submitting
	contentType: string;
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
	chartFileData: null,
	//
	track: "",
	artist: "",
	album: "",
	coverUrl: "",
	trackUrls: [],
	trackPreviewUrl: "",
	difficulty: Difficulty.NORMAL,
	isDeluxe: false,
	isExplicit: false,
	//
	chartUrl: "",
	chartPreviewUrl: "",
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
	private cookieService = inject(CookieService);
	private cacheService = inject(CacheService);
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
				data: {
					formData: this.formData,
				},
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
		if (this.currentStepSubject.value >= uploadStepComponents.length)
			throw new Error("Invalid step");
		return uploadStepComponents[this.currentStepSubject.value];
	}

	private getTotalSteps(): number {
		return uploadStepComponents.length;
	}

	private triggerError(message: string, error: string) {
		this.dialog.closeAll();
		this.dialog.open(UploadDialogErrorComponent, {
			data: {
				message,
				error,
			},
		});
		/* this.reset(); */
	}

	private async submitForm() {
		// Check if user is logged in
		if (!this.authService.isLoggedIn()) {
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: "Você precisa estar logado para enviar conteúdo.",
					error: null,
				},
			});
			this.router.navigate(["/login"]);
			return;
		}

		// Open loading dialog
		const loadingDialog = this.dialog.open(UploadDialogLoadingComponent, {
			disableClose: true,
		});

		try {
			// Handle track data retrieval (cover art, track and artist names confirmation)
			try {
				const response = await getMediaInfo(
					this.formData.track,
					this.formData.artist,
					this.cookieService,
				);
				console.log("Media info retrieved:", response);

				// Update form data with retrieved info
				this.formData = {
					...this.formData,
					...response,
				};
			} catch (error: any) {
				console.warn("Failed to retrieve media info:", error);
				// Continue with user provided data if media info retrieval fails
				if (!this.formData.coverUrl) {
					throw new Error(
						"We couldn't find the album cover. Please check your track and artist names and try again.",
					);
				}
			}

			// Handle track streaming services URL retrieval
			try {
				if (
					this.formData.trackUrls &&
					this.formData.trackUrls.length > 0
				) {
					this.formData.trackUrls = await getTrackStreamingLinks(
						this.formData.trackUrls[0].url,
						this.formData.track,
						this.formData.artist,
					);
				}
			} catch (error: any) {
				console.warn(
					"Failed to retrieve track streaming links:",
					error,
				);
			}

			// Handle chart data submission (basic and first version creation)
			const { contentType, chartFileData, ...rest } = this.formData;

			const data: CreateChartModel = {
				...rest,
				...chartFileData,
			};

			console.log("Form submitted with the following data:", data);

			// Submit chart data
			const response = await this.chartService.createChart(data);
			console.log("Chart submitted successfully:", response);

			if (!response) {
				throw new Error(
					"No response received from the server. Please try again later.",
				);
			}

			// Cache chart data
			this.cacheService.addChart(response);

			console.log("durations:", response.versions?.[0].duration);
			console.log("notesAmount:", response.versions?.[0].notesAmount);

			// Close loading dialog and open success dialog
			loadingDialog.close();
			this.dialog.open(UploadDialogSuccessComponent, {
				hasBackdrop: true,
				disableClose: true,
				data: response,
			});
		} catch (error: any) {
			console.error("Failed to submit chart:", error);

			loadingDialog.close();
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					title: "Failed to submit chart",
					message:
						error.statusText ||
						"There was an error while submitting the chart.",
					error: error.error.message || error,
				},
			});
		} finally {
			this.reset();
		}
	}
}
