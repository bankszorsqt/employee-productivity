import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { EmployeePayment } from "../../models/employee.model";
import {CurrencyPipe, DecimalPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginator, MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import {FormatHoursPipe} from "../../pipes/format-hours.pipe";

@Component({
  selector: "app-employees-list",
  standalone: true,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    NgSwitchDefault,
    DecimalPipe,
    FormatHoursPipe,
  ],
  templateUrl: "./employees-list.component.html",
  styleUrl: "./employees-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesListComponent implements OnChanges {
  @Input() employeePayments: EmployeePayment[] = [];
  @Input() loading!: boolean;
  @Input() totalSize!: number;
  @Output() pageIndexChange = new EventEmitter<number>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;

  // TODO: add dynamic change and sorting
  pageSize = 10;
  selection = new SelectionModel<EmployeePayment>(true, []);
  displayedColumns: string[] = ["id", "name", "email", "clockedIn", "regularPay", "overtimePay"];
  columns: { name: string; value: string }[] = [
    { name: "Id", value: "id" },
    { name: "Name", value: "name" },
    { name: "Email", value: "email" },
    { name: "Clocked In (h)", value: "clockedIn" },
    { name: "Regular ($)", value: "regularPay" },
    { name: "Overtime ($)", value: "overtimePay" },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["totalSize"]?.currentValue.length > 0 || changes["employeePayments"]?.currentValue.length > 0) {
      this.employeePayments = changes["employeePayments"].currentValue;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.employeePayments.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.employeePayments);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: EmployeePayment): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1}`;
  }

  onPageChange(event: PageEvent | { pageIndex: number }): void {
    this.pageIndexChange.emit(event.pageIndex);
  }
}
