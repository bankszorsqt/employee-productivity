import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from "@angular/material/dialog";
import { Employee, EmployeePayment } from "../../../models/employee.model";
import { MatButtonModule } from "@angular/material/button";
import { EditEmployeeComponent } from "../edit-employee/edit-employee.component";
import { MatDividerModule } from "@angular/material/divider";
import { NgIf } from "@angular/common";
import { EditShiftComponent } from "../edit-shift/edit-shift.component";
import { forkJoin, Observable } from "rxjs";
import { ShiftService } from "../../../services/shift.service";
import { Shift } from "../../../models/shift.model";
import { EmployeeService } from "../../../services/employee.service";
import { UtilService } from "../../../services/util.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SharedDataService } from "../../../services/shared-data.service";

@Component({
  selector: "app-bulk-edit-employees",
  standalone: true,
  imports: [
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    MatDialogContent,
    EditEmployeeComponent,
    MatDividerModule,
    NgIf,
    EditShiftComponent,
  ],
  templateUrl: "./bulk-edit-employees.component.html",
  styleUrl: "./bulk-edit-employees.component.scss",
})
export class BulkEditEmployeesComponent {
  updateShiftsObservables: Observable<Shift>[] = [];
  updateEmployeesObservables: Observable<Employee>[] = [];
  modifiedEmployees: Employee[] = [];
  modifiedShifts: Shift[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { employees: EmployeePayment[] },
    private snackBarService: MatSnackBar,
    private employeeService: EmployeeService,
    private shiftService: ShiftService,
    private sharedDataService: SharedDataService
  ) {}

  setModifiedEmployees(modifiedEmployee: Employee): void {
    UtilService.updateArrayItemIfExists<Employee>(this.modifiedEmployees, modifiedEmployee);
  }

  setModifiedShifts(modifiedShift: Shift): void {
    UtilService.updateArrayItemIfExists<Shift>(this.modifiedShifts, modifiedShift);
  }

  // Create an observable for each employee update operation
  createEmployeeObservables(): void {
    if (this.modifiedEmployees.length > 0) {
      this.modifiedEmployees.forEach((employee) => {
        const updateObservable = this.employeeService.updateEmployee(employee);
        this.updateEmployeesObservables.push(updateObservable);
      });
    }
  }

  createShiftObservables(): void {
    if (this.modifiedShifts.length > 0) {
      this.modifiedShifts.forEach((shift) => {
        const updateObservable = this.shiftService.updateShift(shift);
        this.updateShiftsObservables.push(updateObservable);
      });
    }
  }

  saveEmployeesAndTheirShifts(): void {
    this.createEmployeeObservables();
    this.createShiftObservables();
    const hasEmployees = this.updateEmployeesObservables.length > 0;
    const hasShifts = this.updateShiftsObservables.length > 0;
    const namesText = `${hasEmployees ? "Employees" : ""} ${hasEmployees && hasShifts ? "and" : ""} ${hasShifts ? "Shifts" : ""}`;
    const allObservables = [...this.updateEmployeesObservables, ...this.updateShiftsObservables];
    forkJoin(allObservables).subscribe(
      () => {
        this.sharedDataService.refreshData(true);
        this.openSnackBar(`${namesText} updated Insightfully!`);
      },
      () => {
        this.openSnackBar(`Error updating ${namesText}`);
      }
    );
  }

  openSnackBar(message: string): void {
    this.snackBarService.open(message, "Hooray!", { verticalPosition: "top", duration: 5000 });
  }
}
