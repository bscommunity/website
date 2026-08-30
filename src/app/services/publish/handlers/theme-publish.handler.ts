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
import type { ThemeAssets } from "@/models/theme/beatstar-themes";
import { getBeatstarTheme } from "@/models/theme/theme-genres";

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
	assetsFromBatch?: boolean;
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

function stripExtension(fileName: string): string {
	return fileName.replace(/\.[^.]+$/, "");
}

@Injectable({ providedIn: "root" })
export class ThemePublishHandler
	implements PublishHandler<ThemeFormData, ThemeModel> {
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

	shouldSkipStep(stepIndex: number, formData: ThemeFormData): boolean {
		const component = this.getStepComponents()[stepIndex];
		return (
			component === PublishThemeFilesComponent &&
			formData.assetsFromBatch === true
		);
	}

	getSuccessComponent(): Type<unknown> {
		return PublishThemeSuccessComponent;
	}

	getItemLabel(): string {
		return "theme";
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

		if (!iconFile || !displayFile) {
			throw new Error("Icon and display files are required.");
		}

		if (!topFile || !perfectBarFile) {
			throw new Error("Top file and perfect bar file are required.");
		}

		const assetEntries: [keyof ThemeAssets, File][] = [];
		if (iconFile) assetEntries.push(["icon", iconFile]);
		if (trackFile) assetEntries.push(["track", trackFile]);
		if (topFile) assetEntries.push(["top", topFile]);
		if (bottomFile) assetEntries.push(["bottom", bottomFile]);
		if (circleFile) assetEntries.push(["circle", circleFile]);
		if (perfectBarFile) assetEntries.push(["perfectBar", perfectBarFile]);
		if (perfectLineFile)
			assetEntries.push(["perfectLine", perfectLineFile]);

		let bundleFile: File | null = null;
		if (assetEntries.length > 0) {
			const replacedTheme = rest.replaces
				? getBeatstarTheme(rest.replaces)
				: undefined;
			const zip = new JSZip();
			for (const [assetType, file] of assetEntries) {
				const uuid = replacedTheme?.assets[assetType] || null;
				zip.file(uuid ?? stripExtension(file.name), file);
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

		console.log("Submitting theme with payload:", payload);

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
