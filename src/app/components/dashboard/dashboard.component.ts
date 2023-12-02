import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StatsComponent } from "../stats/stats.component";
import { EmployeesListComponent } from "../employees-list/employees-list.component";
import { EmployeeService } from "../../services/employee.service";
import { Employee, EmployeePayment } from "../../models/employee.model";
import { combineLatest, first } from "rxjs";
import { Shift } from "../../models/shift.model";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterOutlet, StatsComponent, EmployeesListComponent, NgOptimizedImage],
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
  loadingEmployees: boolean = true;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getAllEmployeesAndShifts();
  }

  getAllEmployeesAndShifts(): void {
    combineLatest([this.employeeService.getEmployees(), this.employeeService.getShifts()])
      .pipe(first())
      .subscribe(([allEmployees, shifts]) => {
        this.totalEmployees = allEmployees.length;
        this.shifts = shifts;
        this.allEmployeePayments = this.calculateTotalPay(allEmployees);
        this.getEmployeesPaginated(0);
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
  }

  getEmployeesPaginated(pageIndex: number): void {
    this.employeeService.getEmployeesPaginated(pageIndex).subscribe((employees) => {
      this.loadingEmployees = false;
      this.employeePayments = this.calculateTotalPay(employees);
    });
  }

  calculateShiftDuration(clockIn: number, clockOut: number) {
    return clockOut - clockIn;
  }

  calculateHoursWorked(shiftDuration: number) {
    return shiftDuration / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  transformHoursToHoursAndMinutes(hours: number) {
    const hoursString = Math.floor(hours).toString();
    const minutesString = Math.floor((hours - Math.floor(hours)) * 60).toString();
    return `${hoursString}h ${minutesString}m`;
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
}
