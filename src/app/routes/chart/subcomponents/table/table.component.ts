import { Component, Input, OnInit } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";

export interface TableColumn<T> {
	columnDef: string;
	header: string;
	cell: (element: T) => string;
}

export interface Action<T> {
	description: string;
	icon: string;
	callback: (item: T) => void;
}

@Component({
	selector: "app-table",
	templateUrl: "./table.component.html",
	imports: [MatTableModule, MatIconModule, MatTooltipModule, MatRippleModule],
})
export class TableComponent<T> implements OnInit {
	@Input() columns: TableColumn<T>[] = [];
	@Input() data: T[] = [];
	@Input() actions: Action<T>[] | undefined;

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
