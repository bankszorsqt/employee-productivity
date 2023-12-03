import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Employee, TableOptions } from "../models/employee.model";
import { Observable } from "rxjs";

const API_URL = "http://localhost:3000/employees";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get(`${API_URL}`) as Observable<Employee[]>;
  }

  getEmployeesPaginated({ pageIndex, pageSize = 10, order = "asc" }: TableOptions): Observable<Employee[]> {
    return this.http.get(`${API_URL}?_page=${pageIndex + 1}&_limit=${pageSize}&_sort=name&_order=${order}`) as Observable<Employee[]>;
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.patch(`${API_URL}/${employee.id}`, { ...employee }) as Observable<Employee>;
  }
}
