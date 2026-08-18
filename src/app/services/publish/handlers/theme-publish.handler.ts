import { Injectable, inject, type Type } from "@angular/core";
import { PublishThemeDetailsComponent } from "@/components/publish/theme/details.component";
import { PublishThemeBatchFilesComponent } from "@/components/publish/theme/batch-files.component";
import { PublishThemeFilesComponent } from "@/components/publish/theme/files.component";
import { PublishThemeSuccessComponent } from "@/components/publish/theme/success.component";
// Components
import { PublishTypeComponent } from "@/components/publish/type.component";
import { PublishContributorsComponent } from "@/components/publish/contributors/contributors.component";
// Models
import type { ThemeModel } from "@/models/theme.model";
import type { SimplifiedContributorModel } from "@/models/contributor.model";

// Services
import { ThemeService, type CreateThemePayload } from "@/services/api/theme.service";
import type { PublishHandler } from "../publish-handler.interface";
import JSZip from "jszip";

export interface ThemeFormData {
	name: string;
	previewUrl: string;
	genre: string;
	replaces: string;
	originalArtwork: string;
	displayFile: File | null;
	iconFile: File | null;
	trackFile: File | null;
	topFile: File | null;
	bottomFile: File | null;
	circleFile: File | null;
	perfectBarFile: File | null;
	perfectLineFile: File | null;
	bundleFile: File | null;
	contributors?: SimplifiedContributorModel[];
}

export const initialThemeFormData: ThemeFormData = {
	name: "",
	previewUrl: "",
	genre: "",
	replaces: "",
	originalArtwork: "",
	displayFile: null,
	iconFile: null,
	trackFile: null,
	topFile: null,
	bottomFile: null,
	circleFile: null,
	perfectBarFile: null,
	perfectLineFile: null,
	bundleFile: null,
};

@Injectable({ providedIn: "root" })
export class ThemePublishHandler
	implements PublishHandler<ThemeFormData, ThemeModel>
{
	private themeService = inject(ThemeService);

	getStepComponents(): Type<unknown>[] {
		return [
			PublishTypeComponent,
			PublishThemeDetailsComponent,
			PublishThemeBatchFilesComponent,
			PublishThemeFilesComponent,
			PublishContributorsComponent,
		];
	}

	getInitialFormData(): ThemeFormData {
		return { ...initialThemeFormData };
	}

	getSuccessComponent(): Type<unknown> {
		return PublishThemeSuccessComponent;
	}

	async submit(data: ThemeFormData, publishSessionId?: string): Promise<ThemeModel> {
		const {
			iconFile,
			trackFile,
			topFile,
			bottomFile,
			circleFile,
			perfectBarFile,
			perfectLineFile,
			genre,
			contributors,
			bundleFile: _bundleFile,
			displayFile,
			...rest
		} = data;

		const assetEntries: [string, File][] = [];
		if (iconFile) assetEntries.push([iconFile.name, iconFile]);
		if (trackFile) assetEntries.push([trackFile.name, trackFile]);
		if (topFile) assetEntries.push([topFile.name, topFile]);
		if (bottomFile) assetEntries.push([bottomFile.name, bottomFile]);
		if (circleFile) assetEntries.push([circleFile.name, circleFile]);
		if (perfectBarFile) assetEntries.push([perfectBarFile.name, perfectBarFile]);
		if (perfectLineFile) assetEntries.push([perfectLineFile.name, perfectLineFile]);

		let bundleFile: File | null = null;
		if (assetEntries.length > 0) {
			const zip = new JSZip();
			for (const [name, file] of assetEntries) {
				zip.file(name, file);
			}
			const blob = await zip.generateAsync({ type: "blob" });
			bundleFile = new File([blob], "theme.zip", { type: "application/zip" });
		}

		const payload: CreateThemePayload = {
			name: rest.name,
			replaces: rest.replaces,
			previewUrl: rest.previewUrl || null,
			originalArtwork: rest.originalArtwork || null,
			coverFile: iconFile ?? null,
			displayFile: displayFile ?? null,
			bundleFile,
		};

		const response = await this.themeService.createTheme(
			payload,
			publishSessionId,
		);

		if (!response)
			throw new Error(
				"No response received from the server. Please try again later.",
			);

		console.log("Theme created successfully:", response);

		return response;
	}
}
