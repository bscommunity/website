import { NgFor } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";

export interface TableColumn<T> {
	columnDef: string;
	header: string;
	cell: (element: T) => string;
}

@Component({
	selector: "app-table",
	templateUrl: "./table.component.html",
	imports: [NgFor, MatTableModule],
})
export class TableComponent<T> implements OnInit {
	@Input() columns: TableColumn<T>[] = [];
	@Input() data: T[] = [];

	displayedColumns: string[] = [];
	dataSource!: MatTableDataSource<T>;

	ngOnInit() {
		this.displayedColumns = this.columns.map((c) => c.columnDef);
		this.dataSource = new MatTableDataSource(this.data);
	}
}
