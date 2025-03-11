export interface LastFMResponse {
	track: {
		name: string;
		url: string;
		duration: string;
		streamable: {
			"#text": string;
			fulltrack: string;
		};
		listeners: string;
		playcount: string;
		artist: {
			name: string;
			url: string;
		};
		album: {
			artist: string;
			title: string;
			url: string;
			image: {
				"#text": string;
				size: string;
			}[];
		};
		toptags: {
			tag: any[];
		};
	};
}
