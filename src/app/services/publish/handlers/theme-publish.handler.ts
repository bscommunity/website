import { Injectable, inject, type Type } from "@angular/core";
import { PublishThemeFlowComponent } from "@/components/publish/theme/flow.component";
import { PublishThemeDetailsComponent } from "@/components/publish/theme/details.component";
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

export interface ThemeFormData {
	name: string;
	previewUrl: string;
	genre: string;
	replaces: string;
	originalArtwork: string;
	iconFile: File | null;
	trackFile: File | null;
	topFile: File | null;
	bottomFile: File | null;
	circleFile: File | null;
	perfectBarFile: File | null;
	perfectLineFile: File | null;
	contributors?: SimplifiedContributorModel[];
}

export const initialThemeFormData: ThemeFormData = {
	name: "",
	previewUrl: "",
	genre: "",
	replaces: "",
	originalArtwork: "",
	iconFile: null,
	trackFile: null,
	topFile: null,
	bottomFile: null,
	circleFile: null,
	perfectBarFile: null,
	perfectLineFile: null,
};

@Injectable({ providedIn: "root" })
export class ThemePublishHandler
	implements PublishHandler<ThemeFormData, ThemeModel>
{
	private themeService = inject(ThemeService);

	getStepComponents(): Type<unknown>[] {
		return [
			PublishTypeComponent,
			PublishThemeFlowComponent,
			PublishThemeDetailsComponent,
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
			...rest
		} = data;

		const payload: CreateThemePayload = {
			name: rest.name,
			replaces: rest.replaces,
			previewUrl: rest.previewUrl || null,
			originalArtwork: rest.originalArtwork || null,
			coverFile: iconFile ?? null,
			displayFile: null,
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
