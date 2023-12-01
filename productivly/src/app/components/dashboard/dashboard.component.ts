import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StatsComponent } from "../stats/stats.component";
import { EmployeesListComponent } from "../employees-list/employees-list.component";
import { EmployeeService } from "../../services/employee.service";
import { Employee } from "../../models/employee.model";
import { first } from "rxjs";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterOutlet, StatsComponent, EmployeesListComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  employees: Employee[] = [];
  totalEmployees = 0;
  paidAmount = 0;
  overtimePaidAmount = 0;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {

    // TODO: Get clockedIn (and merge with employees)
    this.employeeService
      .getEmployees()
      .pipe(first())
      .subscribe((employees) => {
        this.employees = employees;
        this.totalEmployees = employees.length;
        this.paidAmount = employees.reduce((acc, employee) => acc + employee.hourlyRate, 0);
        this.overtimePaidAmount = employees.reduce((acc, employee) => acc + employee.hourlyRateOvertime, 0);
      });
  }
}
