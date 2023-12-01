import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Employee, EmployeeClockIn } from "../../models/employee.model";
import {CurrencyPipe, NgFor, NgIf, NgSwitch, NgSwitchCase} from "@angular/common";

@Component({
  selector: "app-employees-list",
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule, NgFor, NgIf, NgSwitch, NgSwitchCase, CurrencyPipe],
  templateUrl: "./employees-list.component.html",
  styleUrl: "./employees-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesListComponent implements OnChanges, AfterViewInit {
  @Input() employees: Employee[] = [];

  dataSource = new MatTableDataSource<Employee>();

  displayedColumns: string[] = ["id", "name", "email", "hourlyRate", "hourlyRateOvertime"];
  columns: { name: string; value: string }[] = [
    { name: "Id", value: "id" },
    { name: "Name", value: "name" },
    { name: "Email", value: "email" },
    { name: "Regular ($)", value: "hourlyRate" },
    { name: "Overtime ($)", value: "hourlyRateOvertime" },
  ];
  selection = new SelectionModel<Employee>(true, []);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["employees"].currentValue.length > 0) {
      this.dataSource = new MatTableDataSource<Employee>(this.employees);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<Employee>(this.employees);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: EmployeeClockIn): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.id + 1}`;
  }
}
