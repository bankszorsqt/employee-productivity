import { Component, Injector, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StatsComponent } from "../total-stats/stats/stats.component";
import { EmployeesListComponent } from "../employees-list/employees-list.component";
import { EmployeeService } from "../../services/employee.service";
import { Employee, EmployeePayment, TableOptions } from "../../models/employee.model";
import { combineLatest, first } from "rxjs";
import { Shift } from "../../models/shift.model";
import { KeyValue, NgOptimizedImage } from "@angular/common";
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
        this.allEmployeePayments = this.calculateTotalPay(allEmployees, shifts);
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
      this.totalClockedInTime += employee.clockedInTotal;
    });
    this.isLoadingStats = false;
  }

  getEmployeesPaginated(options: TableOptions): void {
    this.employeeService
      .getEmployeesPaginated(options)
      .pipe(first())
      .subscribe((employees) => {
        this.isLoadingEmployees = false;
        this.employeePayments = this.calculateTotalPay(employees, this.shifts);
      });
  }

  calculateShiftDuration(clockIn: number, clockOut: number) {
    return clockOut - clockIn;
  }

  calculateHoursWorked(shiftDuration: number) {
    return shiftDuration / (1000 * 60 * 60);
  }

  calculatePayForDay(
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
    const allShiftsPerEmployee = shifts.filter((shift) => shift.employeeId === employee.id);

    const employeeShiftsByDay: Record<string, { clockIn: Date; clockOut: Date }[]> = {};
    allShiftsPerEmployee.forEach((shift) => {
      // Convert timestamps to Date objects
      const clockIn = new Date(shift.clockIn);
      const clockOut = new Date(shift.clockOut);

      // Get the date in "YYYY-MM-DD" format
      const dateKey = clockIn.toISOString().split("T")[0];

      // If the dateKey doesn't exist, initialize it
      if (!employeeShiftsByDay[dateKey]) {
        employeeShiftsByDay[dateKey] = [];
      }
      employeeShiftsByDay[dateKey].push({ clockIn, clockOut });
    });

    // Get how many hours per day employee worked
    const hoursWorkedPerDay: Record<string, number> = {};
    for (const [date, shifts] of Object.entries(employeeShiftsByDay)) {
      let totalHours = 0;
      // Calculate the total hours worked for the day
      shifts.forEach((shift) => {
        const duration = (shift.clockOut.getTime() - shift.clockIn.getTime()) / (1000 * 60 * 60); // in hours
        totalHours += duration;
      });
      // Store total hours for the day
      hoursWorkedPerDay[date] = totalHours;
    }
    const payDetails = {
      regularPay: 0,
      overtimePay: 0,
      totalEmployeeHours: 0,
    };
    // Calculate pay for each day and aggregate it
    for (const [, hours] of Object.entries(hoursWorkedPerDay)) {
      const { regularPay, overtimePay, totalEmployeeHours } = this.calculatePayForDay(hours, employee);
      payDetails.regularPay += regularPay;
      payDetails.overtimePay += overtimePay;
      payDetails.totalEmployeeHours += totalEmployeeHours;
    }
    return payDetails;
  }

  calculateTotalPay(employees: Employee[], shifts: Shift[]): EmployeePayment[] {
    return employees.map((employee) => {
      const { regularPay, overtimePay, totalEmployeeHours } = this.calculateTotalPayForEmployee(employee, shifts);
      return {
        ...employee,
        clockedInTotal: totalEmployeeHours,
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
