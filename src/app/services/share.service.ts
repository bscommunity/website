import { Injectable, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
	providedIn: "root",
})
export class ShareService {
	private _snackBar = inject(MatSnackBar);

	share(url: string, title?: string): void {
		if (title && navigator.share) {
			navigator
				.share({
					title,
					url,
				})
				.catch(() => {
					this.copyToClipboard(url);
				});
		} else {
			this.copyToClipboard(url);
		}
	}

	private copyToClipboard(url: string): void {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				this._snackBar.open("Link copied to clipboard!", "Close", {
					duration: 2000,
				});
			})
			.catch(() => {
				this._snackBar.open("Failed to copy link", "Close", {
					duration: 2000,
				});
			});
	}
}
