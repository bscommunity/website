import { Injectable, inject } from "@angular/core";
import { Observable, from, switchMap } from "rxjs";

import { AuthService } from "../auth.service";
import { apiUrl } from "@/lib/api";

export interface PublishEvent {
	step: string;
	message: string;
}

@Injectable({
	providedIn: "root",
})
export class PublishEventService {
	private authService = inject(AuthService);

	private readonly sseUrl = `${apiUrl}/charts/publish/events`;

	connect(sessionId: string): Observable<PublishEvent> {
		return from(this.authService.getValidToken()).pipe(
			switchMap((token) => this.createEventSource(sessionId, token)),
		);
	}

	private createEventSource(
		sessionId: string,
		token: string | null,
	): Observable<PublishEvent> {
		return new Observable<PublishEvent>((observer) => {
			const url = new URL(this.sseUrl);
			url.searchParams.set("sessionId", sessionId);

			const abortController = new AbortController();

			fetch(url.toString(), {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "text/event-stream",
				},
				signal: abortController.signal,
			})
				.then(async (response) => {
					if (!response.ok) {
						observer.error(
							new Error(`SSE connection failed: ${response.status}`),
						);
						return;
					}

					const reader = response.body?.getReader();
					if (!reader) {
						observer.error(new Error("No response body"));
						return;
					}

					const decoder = new TextDecoder();
					let buffer = "";

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							buffer += decoder.decode(value, { stream: true });
							const lines = buffer.split("\n");
							buffer = lines.pop() || "";

							let currentEvent = "";
							let currentData = "";

							for (const rawLine of lines) {
								const line = rawLine.replace(/\r$/, "");

								if (line.startsWith("event:")) {
									currentEvent = line.slice(6).trim();
								} else if (line.startsWith("data:")) {
									currentData = line.slice(5).trim();
								} else if (line === "" && currentEvent && currentData) {
									observer.next({
										step: currentEvent,
										message: currentData,
									});

									if (currentEvent === "completed") {
										observer.complete();
										return;
									}

									currentEvent = "";
									currentData = "";
								}
							}
						}
						observer.complete();
					} catch (err) {
						if (!abortController.signal.aborted) {
							observer.error(err);
						}
					}
				})
				.catch((err) => {
					if (!abortController.signal.aborted) {
						observer.error(err);
					}
				});

			return () => {
				abortController.abort();
			};
		});
	}
}
