import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Shift } from "../models/shift.model";

const API_URL = "http://localhost:3000/shifts";

@Injectable({
  providedIn: "root",
})
export class ShiftService {
  constructor(private http: HttpClient) {}

  getShifts(): Observable<Shift[]> {
    return this.http.get(`${API_URL}`) as Observable<Shift[]>;
  }

  getShiftsByEmployeeAndStartDate(startDate: number, employeeId: string): Observable<{ dates: Set<string>; shifts: Shift[] }> {
    const filterDate = new Date(startDate).toDateString();
    return this.http.get(`${API_URL}?_sort=start&_order=asc`).pipe(
      //@ts-expect-error x is not defined
      map((shifts: Shift[]) => {
        const getUniqueDatesForClockIn = (shifts: Shift[]) => {
          const uniqueEmployeeClockInDates = new Set<string>();
          shifts.forEach((shift) => {
            const date = new Date(shift.clockIn).toDateString();
            uniqueEmployeeClockInDates.add(date);
          });
          return uniqueEmployeeClockInDates;
        };
        const filteredSifts = shifts.filter((shift) => {
          const isSameDate = new Date(shift.clockIn).toDateString() === filterDate;
          const isSameEmployee = shift.employeeId === employeeId;
          return isSameDate && isSameEmployee;
        });
        return { dates: getUniqueDatesForClockIn(shifts), shifts: filteredSifts };
      })
    );
  }

  updateShift(shift: Shift): Observable<Shift> {
    return this.http.patch(`${API_URL}/${shift.id}`, { ...shift }) as Observable<Shift>;
  }
}
