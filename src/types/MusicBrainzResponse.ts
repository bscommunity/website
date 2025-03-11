export interface MusicBrainzRecordingQuery {
	created: string;
	count: number;
	offset: number;
	recordings: Recording[];
}

export interface MusicBrainzRecording {
	title: string;
	length: number;
	relations: Relation[];
	id: string;
	"first-release-date": string;
	disambiguation: string;
	video: boolean;
}

interface Relation {
	type: string;
	"source-credit": string;
	begin: null;
	ended: boolean;
	"target-credit": string;
	"type-id": string;
	url: URL;
	direction: string;
	"target-type": string;
	attributes: any[];
	"attribute-ids": any;
	"attribute-values": any;
	end: null;
}

interface URL {
	id: string;
	resource: string;
}

interface Recording {
	id: string;
	score: number;
	title: string;
	length: number;
	disambiguation?: string;
	video: boolean | null;
	"artist-credit": ArtistCredit[];
	releases: Release[];
	"first-release-date"?: string;
	tags?: Tag[];
	isrcs?: string[];
}

interface ArtistCredit {
	name: string;
	artist: Artist;
}

interface Artist {
	id: string;
	name: string;
	"sort-name": string;
	disambiguation?: string;
	aliases?: Alias[];
}

interface Alias {
	"sort-name": string;
	"type-id": string;
	name: string;
	locale?: string;
	type: string;
	primary?: boolean;
	"begin-date"?: string | null;
	"end-date"?: string | null;
}

interface Release {
	id: string;
	"status-id"?: string;
	count: number;
	title: string;
	status?: string;
	"artist-credit": ArtistCredit[];
	"release-group": ReleaseGroup;
	"track-count": number;
	media: Media[];
	date?: string;
	country?: string;
	"release-events"?: ReleaseEvent[];
	disambiguation?: string;
}

interface ReleaseGroup {
	id: string;
	"type-id": string;
	"primary-type-id": string;
	title: string;
	"primary-type": string;
	"secondary-types"?: string[];
	"secondary-type-ids"?: string[];
}

interface Media {
	position: number;
	format?: string;
	track: Track[];
	"track-count": number;
	"track-offset": number;
}

interface Track {
	id: string;
	number: string;
	title: string;
	length?: number;
}

interface ReleaseEvent {
	date: string;
	area: Area;
}

interface Area {
	id: string;
	name: string;
	"sort-name": string;
	"iso-3166-1-codes": string[];
}

interface Tag {
	count: number;
	name: string;
}
