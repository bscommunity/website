import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
} from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgGlyph } from "@ng-icons/core";

// Components
import { FileFieldComponent } from "@/components/file-field/file-field.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";

interface AssetField {
	key: string;
	label: string;
	dimensions: string;
	info: string;
	file: File | null;
}

@Component({
	selector: "app-publish-theme-files",
	template: `
		<h2 mat-dialog-title>Theme assets</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-3">
				<p>
					Upload the asset files for your theme. Each asset has
					specific dimension requirements.
				</p>

				@for (asset of assets; track asset.key; let i = $index) {
					<app-file-field
						[key]="asset.key"
						[title]="asset.label"
						[accept]="['.png', '.jpg', '.jpeg', '.webp']"
						[isInvalid]="false"
						[info]="asset.info"
						[dimensions]="asset.dimensions"
						[fileName]="asset.file?.name ?? null"
						(fileChange)="onFileChange(asset.key, $event)"
					/>
				}
			</mat-dialog-content>
			<mat-dialog-actions align="center" class="gap-2">
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="submit"
					[disabled]="!hasAtLeastOneFile()"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatTooltipModule,
		FormsModule,
		ReactiveFormsModule,
		FileFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeFilesComponent {
	private fb = inject(FormBuilder);
	private cdr = inject(ChangeDetectorRef);

	dialogRef = inject<MatDialogRef<PublishThemeFilesComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	form: FormGroup = this.fb.group({});

	assets: AssetField[] = [
		{
			key: "iconFile",
			label: "Icon",
			dimensions: "256x256",
			info: "Square icon used as the theme thumbnail. Must be exactly 256x256 pixels.",
			file: null,
		},
		{
			key: "trackFile",
			label: "Track",
			dimensions: "512x512",
			info: "Track lane background. Must be exactly 512x512 pixels.",
			file: null,
		},
		{
			key: "topFile",
			label: "Top",
			dimensions: "512x256",
			info: "Top section of the track. Must be exactly 512x256 pixels.",
			file: null,
		},
		{
			key: "bottomFile",
			label: "Bottom",
			dimensions: "512x256",
			info: "Bottom section of the track. Must be exactly 512x256 pixels.",
			file: null,
		},
		{
			key: "circleFile",
			label: "Circle",
			dimensions: "256x256",
			info: "Hit circle asset. Must be exactly 256x256 pixels.",
			file: null,
		},
		{
			key: "perfectBarFile",
			label: "Perfect Bar",
			dimensions: "64x256",
			info: "Perfect timing bar. Must be exactly 64x256 pixels.",
			file: null,
		},
		{
			key: "perfectLineFile",
			label: "Perfect Line",
			dimensions: "512x32",
			info: "Perfect timing line. Must be exactly 512x32 pixels.",
			file: null,
		},
	];

	ngOnInit() {
		if (this.data.formData) {
			for (const asset of this.assets) {
				const value =
					this.data.formData[asset.key as keyof ThemeFormData];
				if (value instanceof File) {
					asset.file = value;
				}
			}
		}
	}

	onFileChange(key: string, file: File) {
		const asset = this.assets.find((a) => a.key === key);
		if (asset) {
			asset.file = file;
			this.cdr.markForCheck();
		}
	}

	hasAtLeastOneFile(): boolean {
		return this.assets.some((a) => a.file !== null);
	}

	onSubmit() {
		const result: Record<string, File | null> = {};
		for (const asset of this.assets) {
			result[asset.key] = asset.file;
		}
		this.dialogRef.close(result);
	}
}
