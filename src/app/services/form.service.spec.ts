import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { FormService } from "./form.service";

interface SampleForm {
	name: string;
	note: string | null;
	attachment: File | null;
}

function buildFields(service: FormService) {
	return {
		nameField: service.createTextField({
			key: "name",
			label: "Name",
			required: true,
		}),
		noteField: service.createTextField({
			key: "note",
			label: "Note",
			disabled: true,
		}),
		attachmentField: service.createFileField({
			key: "attachment",
			label: "Attachment",
			accept: [".png"],
			required: true,
		}),
	} as const;
}

describe("FormService", () => {
	let service: FormService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FormService);
	});

	it("builds controls only for the declared fields and applies initial data", () => {
		const form = service.createFormGroup<SampleForm>(
			[
				buildFields(service).nameField,
				buildFields(service).attachmentField,
			],
			{ name: "Alpha" },
		);

		expect(Object.keys(form.controls)).toEqual(["name", "attachment"]);
		expect(form.controls.name.value).toBe("Alpha");
		expect(form.controls.attachment.value).toBeNull();
	});

	it("disables controls declared with disabled: true", () => {
		const form = service.createFormGroup<SampleForm>(
			[
				buildFields(service).nameField,
				buildFields(service).noteField,
			],
			{},
		);

		expect(form.controls.note.disabled).toBe(true);
		expect(form.controls.name.enabled).toBe(true);
	});

	it("includes disabled controls' values in the submitted result (getRawValue)", async () => {
		const file = new File(["x"], "a.png");
		const form = service.createFormGroup<SampleForm>(
			[
				buildFields(service).nameField,
				buildFields(service).noteField,
				buildFields(service).attachmentField,
			],
			{ name: "Alpha", note: "kept", attachment: file },
		);

		const result = await service.submitForm<SampleForm>(
			[
				buildFields(service).nameField,
				buildFields(service).noteField,
				buildFields(service).attachmentField,
			],
			form,
		);

		expect(result.isValid).toBe(true);
		if (result.isValid) {
			expect(result.formValue.name).toBe("Alpha");
			expect(result.formValue.note).toBe("kept");
			expect(result.formValue.attachment).toBe(file);
		}
	});

	it("returns invalid controls and no formValue for an invalid form", async () => {
		const fields = [
			buildFields(service).nameField,
			buildFields(service).attachmentField,
		];
		const form = service.createFormGroup<SampleForm>(fields, {});

		const result = await service.submitForm<SampleForm>(fields, form);

		expect(result.isValid).toBe(false);
		if (!result.isValid) {
			expect(result.invalidControls?.["name"]).toBeDefined();
			expect(result.invalidControls?.["attachment"]).toBeDefined();
			expect("formValue" in result).toBe(false);
		}
		expect(form.controls.name.touched).toBe(true);
		expect(form.controls.name.dirty).toBe(true);
	});

	it("applies onValueProcessed before returning the form value", async () => {
		const fields = [
			service.createTextField({
				key: "note",
				label: "Note",
				onValueProcessed: (value) => value.trim(),
			}),
			buildFields(service).nameField,
			buildFields(service).attachmentField,
		];
		const form = service.createFormGroup<SampleForm>(
			fields,
			{ name: "Alpha", note: "  padded  " },
		);
		form.controls.attachment.setValue(new File(["x"], "a.png"));

		const result = await service.submitForm<SampleForm>(fields, form);

		expect(result.isValid).toBe(true);
		if (result.isValid) {
			expect(result.formValue.note).toBe("padded");
		}
	});

	it("rejects a field whose key is not in the values interface", () => {
		const typoField = service.createTextField({
			key: "nmae",
			label: "Name",
		});
		// @ts-expect-error: "nmae" is not a key of SampleForm
		service.createFormGroup<SampleForm>([typoField]);
	});
});