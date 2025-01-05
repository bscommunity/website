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
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";
import { MatSort, MatSortModule, SortDirection } from "@angular/material/sort";
import { Observable, ReplaySubject } from "rxjs";
import { DataSource } from "@angular/cdk/collections";

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

class CustomDataSource<T> extends DataSource<T> {
	private dataStream = new ReplaySubject<T[]>(1);

	constructor(initialData: T[]) {
		super();
		this.setData(initialData);
	}

	connect(): Observable<T[]> {
		return this.dataStream.asObservable();
	}

	disconnect() {
		this.dataStream.complete();
	}

	setData(data: T[]) {
		this.dataStream.next(data);
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
		if (this.dataSource) {
			this.dataSource.setData(this._data);
		}
	}
	get data(): T[] {
		return this._data;
	}
	private _data: T[] = [];

	@Input() columns: TableColumn<T>[] = [];
	@Input() actions: Action<T>[] | undefined;

	@ViewChild(MatSort) matSort!: MatSort;
	@Input() initialSortColumn = "";
	@Input() initialSortDirection: SortDirection = "asc";

	displayedColumns: string[] = [];
	dataSource!: CustomDataSource<T>;

	ngOnInit() {
		this.displayedColumns = this.columns.map((c) => c.columnDef);
		if (this.actions && this.actions.length > 0) {
			this.displayedColumns.push("actions");
		}

		this.dataSource = new CustomDataSource(this.data);
	}

	addData(newItem: T) {
		this.data = [...this.data, newItem];
	}

	removeData(itemToRemove: T) {
		this.data = this.data.filter((item) => item !== itemToRemove);
	}
}
