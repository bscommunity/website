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

export function getApiErrorMessage(error: unknown): string {
	if (isApiError(error)) {
		return error.error;
	}

	return "An unknown error occurred";
}
