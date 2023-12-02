import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Employee } from "../models/employee.model";
import { Observable } from "rxjs";
import { Shift } from "../models/shift.model";

const API_URL = "http://localhost:3000/";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get(`${API_URL}employees`) as Observable<Employee[]>;
  }

  getEmployeesPaginated(pageIndex: number, pageSize: number = 10): Observable<Employee[]> {
    return this.http.get(`${API_URL}employees?_page=${pageIndex + 1}&_limit=${pageSize}&_sort=name&_order=asc`) as Observable<Employee[]>;
  }

  getShifts(): Observable<Shift[]> {
    return this.http.get(`${API_URL}shifts`) as Observable<Shift[]>;
  }
}
