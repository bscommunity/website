import {
	AfterViewInit,
	Component,
	Input,
	OnInit,
	Pipe,
	PipeTransform,
	ViewChild,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";
import { MatSort, MatSortModule, SortDirection } from "@angular/material/sort";

export interface TableColumn<T> {
	columnDef: string;
	header: string;
	cell: (element: T) => string;
}

export interface Action<T> {
	description: string;
	icon: string;
	disabled: (item: T) => boolean;
	callback: (item: T) => void;
}

@Pipe({
	name: "safeHtml",
})
export class SafeHtmlPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	transform(value: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(value);
	}
}

@Component({
	selector: "app-table",
	templateUrl: "./table.component.html",
	imports: [
		MatTableModule,
		MatSortModule,
		MatIconModule,
		MatTooltipModule,
		MatRippleModule,
		SafeHtmlPipe,
	],
})
export class TableComponent<T> implements OnInit, AfterViewInit {
	constructor(private sanitizer: DomSanitizer) {}

	sanitizeContent(content: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

	@Input() data: T[] = [];
	@Input() columns: TableColumn<T>[] = [];
	@Input() actions: Action<T>[] | undefined;

	@ViewChild(MatSort) sort!: MatSort;
	@Input() hasSorting = "";
	@Input() initialSortColumn = "";
	@Input() initialSortDirection: SortDirection = "asc";

	displayedColumns: string[] = [];
	dataSource!: MatTableDataSource<T>;

	ngOnInit() {
		this.displayedColumns = this.columns.map((c) => c.columnDef);
		if (this.actions && this.actions.length > 0) {
			this.displayedColumns.push("actions");
		}

		this.dataSource = new MatTableDataSource(this.data);
	}

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort;
	}

	addData(newItem: T) {
		this.data = [...this.data, newItem];
		this.dataSource.data = this.data;
	}

	removeData(itemToRemove: T) {
		this.data = this.data.filter((item) => item !== itemToRemove);
		this.dataSource.data = this.data;
		console.log("Removed item", itemToRemove);
		console.log("New data", this.dataSource.data);
	}
}
