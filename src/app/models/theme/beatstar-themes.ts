export type ThemeGenre =
  | "rock"
  | "pop"
  | "alternative"
  | "hipHop"
  | "universal"
  | "rnb"
  | "dance"
  | "country";

export type ThemeTier = "A" | "B" | "S" | "SSS";

export interface ThemeAssets {
  icon: string | null;
  track: string | null;
  top: string | null;
  bottom: string | null;
  circle: string | null;
  perfectBar: string | null;
  perfectLine: string | null;
}

export interface BeatstarTheme {
  id: string;
  name: string;
  tier: ThemeTier | null;
  sourceName: string | null;
  assets: ThemeAssets;
  unmappedAssets: string[];
}

export interface UnmappedTheme {
  sourceName: string;
  tier: ThemeTier | null;
  assets: string[];
}

export interface BeatstarThemeCatalog {
  schemaVersion: number;
  assetTypes: readonly string[];
  genres: Record<ThemeGenre, BeatstarTheme[]>;
  unmappedSkins: UnmappedTheme[];
}
