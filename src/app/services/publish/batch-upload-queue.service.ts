import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, type Subscription, Subject, finalize } from "rxjs";

import { ChartService, type CreateChartPayload } from "../api/chart.service";
import { UserService } from "../api/user.service";
import { Difficulty } from "@/models/enums/difficulty.enum";
import type { ChartModel } from "@/models/chart.model";

export interface Bundle {
	id: string;
	name: string;
	file: File;
	status: "ready" | "uploading" | "success" | "error";
	errorMessage?: string;
	result?: ChartModel;
}

const MAX_CONCURRENT = 3;
const MAX_BUNDLES = 15;

@Injectable({ providedIn: "root" })
export class BatchUploadQueueService {
	private chartService = inject(ChartService);
	private userService = inject(UserService);
	private http = inject(HttpClient);

	private bundles: Bundle[] = [];
	private activeCount = 0;
	private subscriptions = new Map<string, Subscription>();

	private bundlesSubject = new BehaviorSubject<Bundle[]>([]);
	bundles$ = this.bundlesSubject.asObservable();

	private uploadCompletedSubject = new Subject<void>();
	uploadCompleted$ = this.uploadCompletedSubject.asObservable();

	get bundlesCount(): number {
		return this.bundles.length;
	}

	get maxBundles(): number {
		return MAX_BUNDLES;
	}

	constructor() {
		if (typeof window !== "undefined") {
			window.addEventListener("beforeunload", this.onBeforeUnload);
		}
	}

	addFiles(files: File[]): { added: Bundle[]; skipped: string[] } {
		const existingNames = new Set(this.bundles.map((b) => b.name));
		const availableSlots = MAX_BUNDLES - this.bundles.length;
		const skipped: string[] = [];
		const filesToAdd = Array.from(files)
			.filter((f) => f.name.endsWith(".zip"))
			.filter((f) => {
				if (existingNames.has(f.name)) {
					skipped.push(f.name);
					return false;
				}
				return true;
			})
			.slice(0, availableSlots);

		const newBundles: Bundle[] = filesToAdd.map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			file,
			status: "ready" as const,
		}));

		this.bundles = [...newBundles, ...this.bundles];
		this.emit();
		return { added: newBundles, skipped };
	}

	removeBundle(id: string): void {
		const sub = this.subscriptions.get(id);
		if (sub) {
			sub.unsubscribe();
			this.subscriptions.delete(id);
		}

		this.bundles = this.bundles.filter((b) => b.id !== id);
		this.emit();
	}

	enqueue(): void {
		this.processNext();
	}

	cancelAll(): void {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
		this.subscriptions.clear();
		this.bundles = [];
		this.activeCount = 0;
		this.emit();
	}

	private processNext(): void {
		while (this.activeCount < MAX_CONCURRENT) {
			const next = this.bundles.find((b) => b.status === "ready");
			if (!next) break;
			this.activeCount++;
			this.uploadBundle(next);
		}

		if (
			this.activeCount === 0 &&
			!this.bundles.some(
				(b) => b.status === "ready" || b.status === "uploading",
			)
		) {
			this.uploadCompletedSubject.next();
		}
	}

	private uploadBundle(bundle: Bundle): void {
		this.updateBundle(bundle.id, { status: "uploading" });

		const payload: CreateChartPayload = {
			artist: "",
			track: bundle.name.replace(/\.zip$/i, ""),
			album: null,
			trackUrls: [],
			isExplicit: false,
			duration: 0,
			notesAmount: 0,
			effectsAmount: 0,
			difficulty: Difficulty.NORMAL,
			isDeluxe: false,
			chartBundle: bundle.file,
		};

		const sessionId = crypto.randomUUID();
		const { formData, headers } = this.chartService.buildChartData(
			payload,
			sessionId,
		);

		const sub = this.http
			.post<ChartModel>(this.chartService.apiUrlRef, formData, {
				headers,
			})
			.pipe(
				finalize(() => {
					this.subscriptions.delete(bundle.id);
					this.activeCount--;
					this.processNext();
				}),
			)
			.subscribe({
				next: (result) => {
					this.chartService.addChartToCache(result);
					this.userService.addToUploadsCache(result);
					this.updateBundle(bundle.id, { status: "success", result });
				},
				error: (error: unknown) => {
					const message =
						(error &&
						typeof error === "object" &&
						"statusText" in error
							? (error as { statusText?: string }).statusText
							: undefined) ||
						(error instanceof Error
							? error.message
							: "Upload failed");

					this.updateBundle(bundle.id, {
						status: "error",
						errorMessage: message,
					});
				},
			});

		this.subscriptions.set(bundle.id, sub);
	}

	private updateBundle(id: string, changes: Partial<Bundle>): void {
		this.bundles = this.bundles.map((b) =>
			b.id === id ? { ...b, ...changes } : b,
		);
		this.emit();
	}

	private emit(): void {
		this.bundlesSubject.next([...this.bundles]);
	}

	private onBeforeUnload = (): void => {
		this.cancelAll();
	};
}
