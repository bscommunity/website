import { Injectable, inject } from "@angular/core";
// Material
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { ErrorDialogComponent } from "@/components/dialogs/error.component";

// Components
import { PublishDialogSuccessComponent } from "@/components/publish/success.component";
import { PublishChartBatchComponent } from "@/components/publish/chart/batch.component";
// Services
import { AuthService } from "../auth.service";
import { PublishEventService } from "./publish-event.service";
import type { PublishHandler } from "./publish-handler.interface";
import { PublishDialogUploadingComponent } from "@/components/dialogs/uploading/uploading.component";

// Types
import type { CatalogItemModel } from "@/models/catalog-item.model";

export interface DialogData<TFormData = Record<string, unknown>> {
	title?: string | null;
	description?: string | null;
	formData: TFormData;
	inactive?: string[];
}

export interface PublishErrorData {
	title?: string | null;
	message: string;
	error: unknown;
	redirectTo?: string;
}

export type PublishProgressData =
	| {
			data: DialogData["formData"];
			additionalData?: Record<string, unknown>;
	  }
	| "back"
	| "next"
	| "batch";

@Injectable({
	providedIn: "root",
})
export class PublishDialogService<
	TFormData = Record<string, unknown>,
	TSuccessData = unknown,
> {
	private authService = inject(AuthService);
	private publishEventService = inject(PublishEventService);

	private router = inject(Router);
	private dialog = inject(MatDialog);

	private currentStepSubject = new BehaviorSubject<number>(0);
	currentStep$ = this.currentStepSubject.asObservable();

	/** Emits the freshly created item (chart, tour pass or theme). */
	private publishCompletedSubject = new Subject<CatalogItemModel>();
	publishCompleted$ = this.publishCompletedSubject.asObservable();

	private handler!: PublishHandler<TFormData, TSuccessData>;
	private handlersByType: Record<string, PublishHandler<any, any>> | null =
		null;
	private formData!: TFormData;
	private additionalData: Record<string, unknown> = {};

	setHandler(handler: PublishHandler<TFormData, TSuccessData>) {
		this.handler = handler;
		this.formData = handler.getInitialFormData();
	}

	setHandlers(
		handlers: Record<string, PublishHandler<any, any>>,
		defaultType?: string,
	) {
		this.handlersByType = handlers;
		if (defaultType && handlers[defaultType]) {
			this.setHandler(
				handlers[defaultType] as PublishHandler<
					TFormData,
					TSuccessData
				>,
			);
		}
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
		const total = this.getTotalSteps();

		if (this.handler.shouldSkipStep) {
			const direction = step >= this.currentStepSubject.value ? 1 : -1;
			while (
				((direction === 1 && step < total) ||
					(direction === -1 && step > 0)) &&
				this.handler.shouldSkipStep(step, this.formData)
			) {
				step += direction;
			}
		}

		if (step < 0 || step >= total) {
			if (step === total) {
				this.submitForm();
				return;
			}
			throw new Error("Invalid step number");
		}
		this.currentStepSubject.next(step);
		this.openCurrentStep();
	}

	private openCurrentStep() {
		const dialogRef = this.dialog.open<unknown>(this.getStepComponent(), {
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

			if (result === "batch") {
				this.dialog.closeAll();
				const batchRef = this.dialog.open(PublishChartBatchComponent, {
					width: "600px",
					disableClose: true,
				});
				batchRef.afterClosed().subscribe(() => {
					this.router.navigate(["/dashboard/uploads"]);
				});
				this.reset();
				return;
			}

			if (result === "back") {
				this.moveToStep(this.currentStepSubject.value - 1);
			} else if (result === "next") {
				this.moveToStep(this.currentStepSubject.value + 1);
			} else {
				if (
					result &&
					typeof result === "object" &&
					"contentType" in result
				) {
					this.switchHandler(String(result.contentType));
				}
				this.formData = { ...this.formData, ...result };
				if (result.additionalData) {
					this.additionalData = { ...this.additionalData, ...result.additionalData };
				}

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

		const publishSessionId = crypto.randomUUID();
		const progress$ = this.publishEventService.connect(publishSessionId);

		// Open loading dialog
		const loadingDialog = this.dialog.open(
			PublishDialogUploadingComponent,
			{
				disableClose: true,
				width: "450px",
				data: {
					progress$,
					itemLabel: this.handler.getItemLabel?.() ?? "chart",
				},
			},
		);

		try {
			const response = await this.handler.submit(
				this.formData,
				publishSessionId,
			);

			// Post-submit hook (e.g., adding contributors)
			if (this.handler.onPostSubmit) {
				await this.handler.onPostSubmit(this.formData, response);
			}

			// Let active views (e.g. the uploads page) patch themselves
			// with the created item — no refetch needed. The create
			// services already keep the query/entity caches up to date.
			this.publishCompletedSubject.next(response as CatalogItemModel);

			loadingDialog.close();
			const successComponent =
				this.handler.getSuccessComponent?.() ||
				PublishDialogSuccessComponent;
			this.dialog.open(successComponent, {
				hasBackdrop: true,
				disableClose: true,
				data: response,
			});
		} catch (error: unknown) {
			loadingDialog.close();
			const errorMessage =
				(error && typeof error === "object" && "statusText" in error
					? (error as { statusText?: string }).statusText
					: undefined) ||
				"There was an error while submitting the content.";
			const errorDetail =
				error && typeof error === "object" && "error" in error
					? (error as { error?: { message?: unknown } }).error
							?.message || error
					: error;
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to submit content",
					message: errorMessage,
					error: errorDetail,
				},
			});
		} finally {
			this.reset();
		}
	}

	private switchHandler(type: string) {
		const nextHandler = this.handlersByType?.[type];
		if (!nextHandler || nextHandler === this.handler) return;
		this.handler = nextHandler as PublishHandler<TFormData, TSuccessData>;
		this.formData = this.handler.getInitialFormData();
		this.additionalData = {};
	}
}
