import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { PublishHandler } from "./publish-handler.interface";

// Material
import { MatDialog } from "@angular/material/dialog";

// Components
import { PublishDialogLoadingComponent } from "@/components/dialogs/loading.component";
import { PublishDialogSuccessComponent } from "@/components/publish/success.component";
import { ErrorDialogComponent } from "@/components/dialogs/error.component";

// Services
import { AuthService } from "../auth.service";

// Types
export type DialogData<TFormData = any> = {
	title?: string | null;
	description?: string | null;
	formData: TFormData;
	inactive?: string[];
};

export interface PublishErrorData {
	title?: string | null;
	message: string;
	error: any;
	redirectTo?: string;
}

export type PublishProgressData =
	| {
			data: any;
			additionalData?: any;
	  }
	| "back"
	| "next";

@Injectable({
	providedIn: "root",
})
export class PublishDialogService<TFormData = any, TSuccessData = any> {
	private authService = inject(AuthService);

	private router = inject(Router);
	private dialog = inject(MatDialog);

	private currentStepSubject = new BehaviorSubject<number>(0);
	currentStep$ = this.currentStepSubject.asObservable();

	private handler!: PublishHandler<TFormData, TSuccessData>;
	private formData!: TFormData;
	private additionalData: any = {};

	setHandler(handler: PublishHandler<TFormData, TSuccessData>) {
		this.handler = handler;
		this.formData = handler.getInitialFormData();
	}

	open() {
		if (!this.handler) throw new Error("No handler set for publish dialog");
		this.currentStepSubject.next(0);
		this.openCurrentStep();
	}

	private reset() {
		this.currentStepSubject.next(0);
		this.formData = this.handler.getInitialFormData();
	}

	private moveToStep(step: number) {
		if (step < 0 || step >= this.getTotalSteps()) {
			if (step === this.getTotalSteps()) {
				this.submitForm();
				return;
			}
			throw new Error("Invalid step number");
		}
		this.currentStepSubject.next(step);
		this.openCurrentStep();
	}

	private openCurrentStep() {
		const dialogRef = this.dialog.open<any>(this.getStepComponent(), {
			disableClose: this.currentStepSubject.value !== 0,
			data: {
				formData: this.formData,
				...this.additionalData,
			},
		});

		dialogRef.afterClosed().subscribe((result: PublishProgressData) => {
			if (!result) {
				// Dialog was closed without action
				return;
			}

			if (result === "back") {
				this.moveToStep(this.currentStepSubject.value - 1);
			} else if (result === "next") {
				this.moveToStep(this.currentStepSubject.value + 1);
			} else {
				this.formData = { ...this.formData, ...result };
				this.additionalData = result.additionalData;

				this.moveToStep(this.currentStepSubject.value + 1);
			}
		});
	}

	private getStepComponent() {
		const steps = this.handler.getStepComponents();
		if (this.currentStepSubject.value >= steps.length)
			throw new Error("Invalid step");
		return steps[this.currentStepSubject.value];
	}

	private getTotalSteps(): number {
		return this.handler.getStepComponents().length;
	}

	private triggerError(message: string, error: string) {
		this.dialog.closeAll();
		this.dialog.open(ErrorDialogComponent, {
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
			this.dialog.open(ErrorDialogComponent, {
				data: {
					message: "You need to be logged in to submit content",
					error: null,
				},
			});
			this.router.navigate(["/login"]);
			return;
		}

		// Open loading dialog
		const loadingDialog = this.dialog.open(PublishDialogLoadingComponent, {
			disableClose: true,
		});

		try {
			const response = await this.handler.submit(this.formData);
			loadingDialog.close();
			this.dialog.open(PublishDialogSuccessComponent, {
				hasBackdrop: true,
				disableClose: true,
				data: response,
			});
		} catch (error: any) {
			loadingDialog.close();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to submit content",
					message:
						error.statusText ||
						"There was an error while submitting the content.",
					error: error.error?.message || error,
				},
			});
		} finally {
			this.reset();
		}
	}
}
