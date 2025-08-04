import { ChartModel } from "@/models/chart.model";
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
export interface PublishHandler<TFormData = any, TSuccessData = any> {
	/* Get the components for each step in the publish flow.
	 * @returns An array of component types that will be used in the publish steps.
	 */
	getStepComponents(): Type<any>[];

	/**
	 * Get the initial form data for the publish process.
	 * @returns The initial data structure that will be used in the form.
	 */
	getInitialFormData(): TFormData;

	/**
	 * Submit the form data for processing.
	 * @param formData - The data to be submitted.
	 * @returns A promise that resolves with the success data upon successful submission.
	 */
	submit(formData: TFormData): Promise<TSuccessData>;

	/**
	 * Optional custom validation for the form data.
	 * @param chart - The current chart data for comparison.
	 * @param formData - The form data to validate.
	 * @returns A boolean indicating whether the validation passed.
	 */
	validate?(chart: Partial<ChartModel>, formData: TFormData): boolean;
}
