import { Type } from "@angular/core";

/**
 * Interface for handling the publish workflow in the application.
 *
 * @template TFormData - The type of the form data used in the publish process.
 * @template TSuccessData - The type of the data returned upon successful submission.
 *
 * @remarks
 * Implement this interface to define the components, initial data, submission logic,
 * and optional custom validation for each step of the publish flow.
 */
export interface PublishHandler<
	TFormData = Record<string, unknown>,
	TSuccessData = unknown,
> {
	/* Get the components for each step in the publish flow.
	 * @returns An array of component types that will be used in the publish steps.
	 */
	getStepComponents(): Type<unknown>[];

	/**
	 * Get the initial form data for the publish process.
	 * @returns The initial data structure that will be used in the form.
	 */
	getInitialFormData(): TFormData;

	/**
	 * Optional hook to determine whether a step should be skipped
	 * during navigation (in both directions).
	 * @param stepIndex - Index of the step in getStepComponents().
	 * @param formData - Current accumulated form data.
	 * @returns True if the step should be skipped.
	 */
	shouldSkipStep?(stepIndex: number, formData: TFormData): boolean;

	/**
	 * Submit the form data for processing.
	 * @param formData - The data to be submitted.
	 * @param publishSessionId - Optional session ID for SSE progress events.
	 * @returns A promise that resolves with the success data upon successful submission.
	 */
	submit(formData: TFormData, publishSessionId?: string): Promise<TSuccessData>;

	/**
	 * Optional success component override for the publish flow.
	 * @returns A component type to render on success.
	 */
	getSuccessComponent?(): Type<unknown>;

	/**
	 * Optional custom validation for the form data.
	 * @param formData - The data to validate.
	 * @returns A string with an error message if validation fails, or null if validation passes.
	 */
	validate?(formData: TFormData): string | null;

	/**
	 * Optional hook called after successful submit and before the success dialog.
	 * Use this to perform post-creation operations (e.g., adding contributors).
	 * @param formData - The submitted form data.
	 * @param response - The data returned by submit().
	 */
	onPostSubmit?(formData: TFormData, response: TSuccessData): Promise<void>;
}
