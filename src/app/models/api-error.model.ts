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
	if (isApiError(error)) {
		return {
			error: error.error,
			message: error.message,
			statusCode: error.statusCode,
		};
	}

	return {
		error: placeholder || "An unknown error occurred",
	};
}
