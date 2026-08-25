import {
	AfterViewInit,
	Component,
	OnInit,
	Pipe,
	PipeTransform,
	effect,
	input,
	model,
	inject,
	output,
	viewChild,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { NgGlyph } from "@ng-icons/core";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRippleModule } from "@angular/material/core";
import { NgTemplateOutlet } from "@angular/common";
import {
	MatSort,
	MatSortModule,
	Sort,
	SortDirection,
} from "@angular/material/sort";

export interface TableColumn<T> {
	columnDef: string;
	header: string;
	cell: (element: T, index: number) => string;
}

export interface Action<T> {
	description: string;
	icon: string;
	disabled: (index: number, item: T) => boolean;
	loading?: (index: number, item: T) => boolean;
	callback?: (index: number, item: T) => void;
	href?: (index: number, item: T) => string;
}

@Pipe({
	name: "safeHtml",
})
export class SafeHtmlPipe implements PipeTransform {
	private sanitizer = inject(DomSanitizer);

	transform(value: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}
}

@Component({
	selector: "app-table",
	templateUrl: "./table.component.html",
	imports: [
		NgTemplateOutlet,
		MatTableModule,
		MatSortModule,
		NgGlyph,
		MatTooltipModule,
		MatProgressSpinnerModule,
		MatRippleModule,
		SafeHtmlPipe,
	],
})
export class TableComponent<T> implements OnInit, AfterViewInit {
	private sanitizer = inject(DomSanitizer);

	sanitizeContent(content: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

	readonly data = model<T[]>([]);
	readonly columns = input<TableColumn<T>[]>([]);
	readonly actions = input<Action<T>[]>();

	readonly sort = viewChild.required(MatSort);
	readonly hasSorting = input("");
	readonly initialSortColumn = input("");
	readonly sortDirection = input<SortDirection>("asc");

	readonly sortChanged = output<Sort>();

	displayedColumns: string[] = [];
	dataSource!: MatTableDataSource<T>;

	constructor() {
		// Keep the material data source in sync whenever the [data] binding
		// emits a new array (guarded until ngOnInit creates the data source).
		effect(() => {
			const data = this.data();
			if (this.dataSource) {
				this.dataSource.data = data;
			}
		});
	}

	ngOnInit() {
		this.displayedColumns = this.columns().map((c) => c.columnDef);
		const actions = this.actions();
		if (actions && actions.length > 0) {
			this.displayedColumns.push("actions");
		}

		this.dataSource = new MatTableDataSource(this.data());
	}

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort();
		this.dataSource.sortingDataAccessor = (
			item: T,
			property: string,
		): string | number => {
			const itemRecord = item as Record<string, unknown>;
			// console.log("Sorting data accessor", item, property);
			const value = itemRecord[property];
			if (typeof value === "number") {
				// Convert the value to a number for proper numeric comparison
				return value;
			}
			return value as string;
		};
	}

	addData(newItem: T) {
		this.data.update((items) => [...items, newItem]);
		this.dataSource.data = this.data();
	}

	removeData(itemToRemove: T) {
		this.data.update((items) =>
			items.filter((item) => item !== itemToRemove),
		);
		this.dataSource.data = this.data();
		// console.log("Removed item", itemToRemove);
		// console.log("New data", this.dataSource.data);
	}

	updateItemData(updatedItem: T) {
		const index = this.data().findIndex((item) => item === updatedItem);
		if (index === -1) {
			console.error("Item not found", updatedItem);
			return;
		}

		this.data.update((items) => {
			const newItems = [...items];
			newItems[index] = updatedItem;
			return newItems;
		});
		this.dataSource.data = this.data();
	}

	updateTableData = (callback: (items: T[]) => T[]) => {
		this.data.update(callback);
		this.dataSource.data = this.data();
	};

	sortData(sort: Sort) {
		this.sortChanged.emit(sort);
	}
}
