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
import { AuthService } from "./auth.service";

// Tipos utilitários compartilhados
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
		const dialogRef = this.dialog.open<any>(this.getStepComponent(), {
			// width: "500px",
			disableClose: this.currentStepSubject.value !== 0,
			data: {
				formData: this.formData,
			},
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			if (result === "back") {
				const previousStep = this.currentStepSubject.value - 1;
				this.currentStepSubject.next(previousStep);
				this.openCurrentStep();
			} else if (result === "next") {
				this.moveToNextStep();
			} else if (result) {
				this.formData = { ...this.formData, ...result };
				this.moveToNextStep();
			} else {
				/* this.reset(); */
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
