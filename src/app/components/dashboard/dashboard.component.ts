import { Component, Injector, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StatsComponent } from "../total-stats/stats/stats.component";
import { EmployeesListComponent } from "../employees-list/employees-list.component";
import { EmployeeService } from "../../services/employee.service";
import { Employee, EmployeePayment, TableOptions } from "../../models/employee.model";
import { combineLatest, first } from "rxjs";
import { Shift } from "../../models/shift.model";
import { NgOptimizedImage } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialog } from "@angular/material/dialog";
import { BulkEditEmployeesComponent } from "../bulk-edit/bulk-edit-employees/bulk-edit-employees.component";
import { ShiftService } from "../../services/shift.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { SharedDataService } from "../../services/shared-data.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    RouterOutlet,
    StatsComponent,
    EmployeesListComponent,
    NgOptimizedImage,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  allEmployeePayments: EmployeePayment[] = [];
  employeePayments: EmployeePayment[] = [];
  shifts: Shift[] = [];

  totalEmployees = 0;
  paidAmount = 0;
  overtimePaidAmount = 0;
  totalClockedInTime = 0;
  isLoadingEmployees = false;
  isLoadingStats = false;
  selectedEmployees: EmployeePayment[] = [];
  defaultTableOptions = { pageIndex: 0, pageSize: 10, order: "asc" };

  constructor(
    private employeeService: EmployeeService,
    private shiftsService: ShiftService,
    private dialog: MatDialog,
    private injector: Injector,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.getAllEmployeesAndShifts();
    this.listenForDataRefresh();
  }

  listenForDataRefresh(): void {
    this.sharedDataService.currentRefreshState.subscribe((refresh: boolean) => {
      if (refresh) {
        this.getAllEmployeesAndShifts();
      }
    });
  }

  getAllEmployeesAndShifts(): void {
    this.isLoadingStats = true;
    this.isLoadingEmployees = true;
    combineLatest([this.employeeService.getEmployees(), this.shiftsService.getShifts()])
      .pipe(first())
      .subscribe(([allEmployees, shifts]) => {
        this.totalEmployees = allEmployees.length;
        this.shifts = shifts;
        this.allEmployeePayments = this.calculateTotalPay(allEmployees);
        this.getEmployeesPaginated(this.defaultTableOptions);
        this.calculateAllStats(this.allEmployeePayments);
      });
  }

  calculateAllStats(employeePayments: EmployeePayment[]): void {
    this.paidAmount = 0;
    this.overtimePaidAmount = 0;
    this.totalClockedInTime = 0;
    employeePayments.forEach((employee: EmployeePayment) => {
      this.paidAmount += employee.regularPay;
      this.overtimePaidAmount += employee.overtimePay;
      this.totalClockedInTime += employee.clockedIn;
    });
    this.isLoadingStats = false;
  }

  getEmployeesPaginated(options: TableOptions): void {
    this.employeeService.getEmployeesPaginated(options).pipe(first()).subscribe((employees) => {
      this.isLoadingEmployees = false;
      this.employeePayments = this.calculateTotalPay(employees);
    });
  }

  calculateShiftDuration(clockIn: number, clockOut: number) {
    return clockOut - clockIn;
  }

  calculateHoursWorked(shiftDuration: number) {
    return shiftDuration / (1000 * 60 * 60);
  }

  calculatePayForShift(
    hoursWorked: number,
    employee: Employee
  ): {
    regularPay: number;
    overtimePay: number;
    totalEmployeeHours: number;
  } {
    const regularHours = Math.min(hoursWorked, 8);
    const overtimeHours = Math.max(hoursWorked - 8, 0);

    const regularPay = regularHours * employee.hourlyRate;
    const overtimePay = overtimeHours * employee.hourlyRateOvertime;

    return { regularPay, overtimePay, totalEmployeeHours: regularHours + overtimeHours };
  }

  calculateTotalPayForEmployee(
    employee: Employee,
    shifts: Shift[]
  ): {
    regularPay: number;
    overtimePay: number;
    totalEmployeeHours: number;
  } {
    return shifts.reduce(
      (payDetails: { regularPay: 0; overtimePay: 0; totalEmployeeHours: 0 }, shift: Shift) => {
        if (shift.employeeId === employee.id) {
          const shiftDuration = this.calculateShiftDuration(shift.clockIn, shift.clockOut);
          const hoursWorked = this.calculateHoursWorked(shiftDuration);
          const { regularPay, overtimePay, totalEmployeeHours } = this.calculatePayForShift(hoursWorked, employee);

          payDetails.regularPay += regularPay;
          payDetails.overtimePay += overtimePay;
          payDetails.totalEmployeeHours += totalEmployeeHours;
          return payDetails;
        }
        return payDetails;
      },
      { regularPay: 0, overtimePay: 0, totalEmployeeHours: 0 }
    );
  }

  calculateTotalPay(employees: Employee[]): EmployeePayment[] {
    return employees.map((employee) => {
      const { regularPay, overtimePay, totalEmployeeHours } = this.calculateTotalPayForEmployee(employee, this.shifts);
      return {
        ...employee,
        clockedIn: totalEmployeeHours,
        regularPay,
        overtimePay,
      };
    });
  }

  setSelectedEmployees(selectedEmployees: EmployeePayment[]): void {
    this.selectedEmployees = selectedEmployees;
  }

  getEmployeeAndShifts(): EmployeePayment[] {
    return this.selectedEmployees.map((employee) => {
      const shifts = this.shifts.filter((shift) => shift.employeeId === employee.id);
      return { ...employee, shifts };
    });
  }

  openBulkUpdateDialog(): void {
    this.dialog.open(BulkEditEmployeesComponent, {
      data: {
        employees: this.getEmployeeAndShifts(),
      },
      disableClose: true,
      width: "100%",
      maxWidth: "1000px",
      injector: this.injector,
    });
  }
}
