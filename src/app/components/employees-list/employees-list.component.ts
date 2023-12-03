import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { EmployeePayment, TableOptions } from "../../models/employee.model";
import { CurrencyPipe, DecimalPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { FormatHoursPipe } from "../../pipes/format-hours.pipe";
import { MatSortModule, Sort } from "@angular/material/sort";
import { SharedDataService } from "../../services/shared-data.service";
import { Subscription } from "rxjs";

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
    MatSortModule,
  ],
  templateUrl: "./employees-list.component.html",
  styleUrl: "./employees-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesListComponent implements OnChanges, OnInit, OnDestroy {
  @Input() employeePayments: EmployeePayment[] = [];
  @Input() isLoading!: boolean;
  @Input() totalSize!: number;
  @Output() pageIndexChange = new EventEmitter<TableOptions>();
  @Output() selectEmployee = new EventEmitter<EmployeePayment[]>();

  selection = new SelectionModel<EmployeePayment>(true, []);
  displayedColumns: string[] = ["id", "name", "email", "clockedInTotal", "regularPay", "overtimePay"];
  columns: { name: string; value: string }[] = [
    { name: "Id", value: "id" },
    { name: "Name", value: "name" },
    { name: "Email", value: "email" },
    { name: "Clocked In (h)", value: "clockedInTotal" },
    { name: "Regular ($)", value: "regularPay" },
    { name: "Overtime ($)", value: "overtimePay" },
  ];
  paginationAndSearchConfig: TableOptions = { pageIndex: 0, pageSize: 10, order: "asc" };
  sortDirection = "asc";
  subs: Subscription = new Subscription();

  constructor(private sharedDataService: SharedDataService) {}

  ngOnInit() {
    this.listenForDataRefresh();
  }

  listenForDataRefresh(): void {
    this.subs.add(
      this.sharedDataService.currentRefreshState.subscribe((refresh: boolean) => {
        if (refresh) {
          this.selection.clear();
          this.selectEmployee.emit([]);
          this.pageIndexChange.emit(this.paginationAndSearchConfig);
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["totalSize"]?.currentValue.length > 0 || changes["employeePayments"]?.currentValue.length > 0) {
      this.employeePayments = changes["employeePayments"].currentValue;
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.employeePayments?.length;
    return numSelected >= numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectEmployee.emit([]);
    } else {
      this.employeePayments?.forEach((row) => this.selection.select(row));
      this.selection.select(...this.employeePayments);
    }
    this.selectEmployee.emit(this.selection.selected);
  }

  onSelectRow(row: EmployeePayment): void {
    this.selection.toggle(row);
    this.selectEmployee.emit(this.selection.selected);
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.selection.clear();
    this.selectEmployee.emit([]);
    this.paginationAndSearchConfig = { pageIndex, pageSize, order: this.sortDirection };
    this.pageIndexChange.emit(this.paginationAndSearchConfig);
  }

  sortName(sortState: Sort): void {
    this.selection.clear();
    this.selectEmployee.emit([]);
    this.sortDirection = sortState.direction;
    this.paginationAndSearchConfig.pageIndex = 0;
    this.pageIndexChange.emit({ ...this.paginationAndSearchConfig, order: sortState.direction });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
