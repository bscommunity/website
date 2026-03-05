import { Injectable, inject } from "@angular/core";

// Services
import { StorageService } from "./storage.service";

// Models
import { ChartModel } from "@/models/chart.model";
import {
	UserProfileResponseModel,
	ContentCountsModel,
} from "@/models/user.model";
import { HistoryItem } from "@/components/history/history.component";

interface ProfileCacheData {
	profile: UserProfileResponseModel;
	isFollowing: boolean;
	isOwnProfile: boolean;
}

interface ChartsCacheData {
	charts: ChartModel[];
	total: number;
	counts?: ContentCountsModel | null;
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

	private getLikesCacheKey(username: string, page: number): string {
		return `likes_${username}_${page}`;
	}

	private getBookmarksCacheKey(username: string, page: number): string {
		return `bookmarks_${username}_${page}`;
	}

	private getActivityCacheKey(username: string): string {
		return `activity_${username}`;
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

	// Likes caching
	getLikes(username: string, page: number): ChartsCacheData | null {
		const cached = this.storageService.getItem(
			this.getLikesCacheKey(username, page),
			true,
		);
		if (!cached) return null;
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.warn("Failed to parse cached likes data:", e);
			return null;
		}
	}

	setLikes(username: string, page: number, data: ChartsCacheData): void {
		this.storageService.setItem(
			this.getLikesCacheKey(username, page),
			JSON.stringify(data),
			true,
		);
	}

	// Bookmarks caching
	getBookmarks(username: string, page: number): ChartsCacheData | null {
		const cached = this.storageService.getItem(
			this.getBookmarksCacheKey(username, page),
			true,
		);
		if (!cached) return null;
		try {
			return JSON.parse(cached);
		} catch (e) {
			console.warn("Failed to parse cached bookmarks data:", e);
			return null;
		}
	}

	setBookmarks(username: string, page: number, data: ChartsCacheData): void {
		this.storageService.setItem(
			this.getBookmarksCacheKey(username, page),
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
