import type { CatalogItemModel } from "@/models/catalog-item.model";
import type { ChartModel } from "@/models/chart.model";
import type { TourPassModel } from "@/models/tour-pass.model";
import type { ThemeModel } from "@/models/theme.model";

export interface ContentByMonth {
	name: string;
	charts: ChartModel[];
	tourPasses: TourPassModel[];
	themes: ThemeModel[];
}

export function groupByMonth(items: CatalogItemModel[]): ContentByMonth[] {
	const map = new Map<string, ContentByMonth>();

	for (const item of items) {
		const dateSource = item.updatedAt ?? item.createdAt;
		const month = dateSource
			? new Date(dateSource).toISOString().slice(0, 7)
			: "unknown";

		if (!map.has(month)) {
			map.set(month, { name: month, charts: [], tourPasses: [], themes: [] });
		}

		const group = map.get(month)!;
		if (isChart(item)) {
			group.charts.push(item);
		} else if (isTourPass(item)) {
			group.tourPasses.push(item);
		} else if (isTheme(item)) {
			group.themes.push(item);
		}
	}

	return Array.from(map.values()).sort((a, b) =>
		b.name.localeCompare(a.name),
	);
}

export function isChart(item: CatalogItemModel): item is ChartModel {
	return item.type === "CHART";
}

export function isTourPass(item: CatalogItemModel): item is TourPassModel {
	return item.type === "TOUR_PASS";
}

export function isTheme(item: CatalogItemModel): item is ThemeModel {
	return item.type === "THEME";
}

export function mapCategoriesToTypes(categories: string[]): string | undefined {
	if (categories.length === 0) return undefined;

	const typeMap: Record<string, string> = {
		Charts: "CHART",
		Tourpasses: "TOUR_PASS",
		Themes: "THEME",
	};

	const types = categories
		.map((cat) => typeMap[cat])
		.filter(Boolean);

	return types.length > 0 ? types.join(",") : undefined;
}
