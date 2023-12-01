import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Employee } from "../models/employee.model";
import { Observable } from "rxjs";

const API_URL = "http://localhost:3000/";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get(`${API_URL}employees`) as Observable<Employee[]>;
  }
}
