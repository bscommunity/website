export interface ApiError {
	error: string;
	message?: string;
	statusCode?: number;
}

export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"error" in error &&
		typeof (error as ApiError).error === "string"
	);
}

export function getApiErrorMessage(
	error: unknown,
	placeholder?: string,
): {
	error: string;
	message?: string;
	statusCode?: number;
} {
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;
		const status = (err["status"] ?? err["statusCode"]) as number | undefined;

		// Angular HttpErrorResponse: error.error is the parsed backend body
		if ("error" in err && typeof err["error"] === "object" && err["error"] !== null) {
			const body = err["error"] as Record<string, unknown>;
			if (typeof body["message"] === "string") {
				return { error: body["message"], message: body["message"], statusCode: status };
			}
		}

		// Direct ApiError shape: { error: string, message?: string }
		if (typeof err["error"] === "string") {
			return {
				error: err["error"] as string,
				message: typeof err["message"] === "string" ? (err["message"] as string) : undefined,
				statusCode: status,
			};
		}
	}

	return {
		error: placeholder || "An unknown error occurred",
	};
}
