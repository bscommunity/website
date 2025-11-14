import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { Subject } from "rxjs";

@Injectable()
export class PaginatorIntl implements MatPaginatorIntl {
	changes = new Subject<void>();

	// For internationalization, the `` function from
	// the `@angular/localize` package can be used.
	// https://material.angular.dev/components/paginator/examples#paginator-intl

	firstPageLabel = `First page`;
	itemsPerPageLabel = `Items per page:`;
	lastPageLabel = `Last page`;

	// You can set labels to an arbitrary string too, or dynamically compute
	// it through other third-party internationalization libraries.
	nextPageLabel = "Next page";
	previousPageLabel = "Previous page";

	getRangeLabel(page: number, pageSize: number, length: number): string {
		if (length === 0) {
			return `Page 1 of 1`;
		}
		const amountPages = Math.ceil(length / pageSize);
		return `Page ${page + 1} of ${amountPages}`;
	}
}
