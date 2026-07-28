import { Injectable, inject } from "@angular/core";

// Services
import { StorageService } from "./storage.service";

// Models
import { ChartModel } from "@/models/chart.model";
import { TourPassModel } from "@/models/tour-pass.model";
import { UserProfileResponseModel } from "@/models/user.model";
import { HistoryItem } from "@/components/history/history.component";

interface ProfileCacheData {
	profile: UserProfileResponseModel;
	isFollowing: boolean;
	isOwnProfile: boolean;
}

interface ChartsCacheData {
	charts: ChartModel[];
	total: number;
}

interface TourPassesCacheData {
	tourPasses: TourPassModel[];
	total: number;
}

@Injectable({
	providedIn: "root",
})
export class ProfileCacheService {
	private storageService = inject(StorageService);

	private getProfileCacheKey(username: string): string {
		return `profile_${username}`;
	}

	private getChartsCacheKey(username: string, page: number): string {
		return `charts_${username}_${page}`;
	}

	private getActivityCacheKey(username: string): string {
		return `activity_${username}`;
	}

	private getTourPassesCacheKey(username: string, page: number): string {
		return `tourpasses_${username}_${page}`;
	}

	// Profile caching
	getProfile(username: string): ProfileCacheData | null {
		const cached = this.storageService.getItem(
			this.getProfileCacheKey(username),
			true,
		);
		if (!cached) return null;
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.warn("Failed to parse cached profile data:", e);
			return null;
		}
	}

	setProfile(username: string, data: ProfileCacheData): void {
		this.storageService.setItem(
			this.getProfileCacheKey(username),
			JSON.stringify(data),
			true,
		);
	}

	// Charts caching
	getCharts(username: string, page: number): ChartsCacheData | null {
		const cached = this.storageService.getItem(
			this.getChartsCacheKey(username, page),
			true,
		);
		if (!cached) return null;
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.warn("Failed to parse cached charts data:", e);
			return null;
		}
	}

	setCharts(username: string, page: number, data: ChartsCacheData): void {
		this.storageService.setItem(
			this.getChartsCacheKey(username, page),
			JSON.stringify(data),
			true,
		);
	}

	// Activity caching
	getActivity(username: string): HistoryItem[] | null {
		const cached = this.storageService.getItem(
			this.getActivityCacheKey(username),
			true,
		);
		if (!cached) return null;
		try {
			const parsed: HistoryItem[] = JSON.parse(cached);
			return parsed.map((item) => ({
				...item,
				date: new Date(item.date),
			}));
		} catch (e) {
			console.warn("Failed to parse cached activity data:", e);
			return null;
		}
	}

	setActivity(username: string, data: HistoryItem[]): void {
		this.storageService.setItem(
			this.getActivityCacheKey(username),
			JSON.stringify(data),
			true,
		);
	}

	// Tour Passes caching
	getTourPasses(username: string, page: number): TourPassesCacheData | null {
		const cached = this.storageService.getItem(
			this.getTourPassesCacheKey(username, page),
			true,
		);
		if (!cached) return null;
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.warn("Failed to parse cached tour passes data:", e);
			return null;
		}
	}

	setTourPasses(username: string, page: number, data: TourPassesCacheData): void {
		this.storageService.setItem(
			this.getTourPassesCacheKey(username, page),
			JSON.stringify(data),
			true,
		);
	}

	// Clear cache for a specific user
	clearUserCache(username: string): void {
		// Note: In a real implementation, you'd need to clear all pages, but for simplicity, clear known keys
		this.storageService.removeItem(this.getProfileCacheKey(username), true);
		this.storageService.removeItem(
			this.getActivityCacheKey(username),
			true,
		);
		// For charts, you might need to iterate or use a pattern, but this is basic
	}
}
