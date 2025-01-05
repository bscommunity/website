import {
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
export class TableComponent<T> implements OnInit {
	constructor(private sanitizer: DomSanitizer) {}

	sanitizeContent(content: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

	@Input() set data(data: T[]) {
		this._data = data;
		this.updateDataSource();
	}
	get data(): T[] {
		return this._data;
	}
	private _data: T[] = [];

	private updateDataSource() {
		this.dataSource = new MatTableDataSource(this.data);
		if (this.matSort) {
			this.dataSource.sort = this.matSort;
		}
	}

	@Input() columns: TableColumn<T>[] = [];
	@Input() actions: Action<T>[] | undefined;

	@ViewChild(MatSort) set matSort(ms: MatSort) {
		this.dataSource.sort = ms;
	}
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
}
