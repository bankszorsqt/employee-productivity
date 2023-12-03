import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { ShiftService } from "../../../services/shift.service";
import { first } from "rxjs";
import { EmployeePayment } from "../../../models/employee.model";
import { DatePipe } from "@angular/common";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from "@angular/material/form-field";
import { MatCalendarCellClassFunction, MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-edit-shift",
  standalone: true,
  imports: [
    MatTableModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    DatePipe,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./edit-shift.component.html",
  styleUrl: "./edit-shift.component.scss",
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditShiftComponent implements OnInit {
  @Input() employee!: EmployeePayment;
  @Output() shiftsEdited = new EventEmitter<any>();

  employeeShiftsOnDate: {
    shiftNo: number;
    id: string;
    employeeId: string;
    clockIn: string | null;
    clockOut: string | null;
    totalTime: string | null;
  }[] = [];

  displayedColumns: string[] = ["shiftNo", "clockIn", "clockOut", "totalTime"];
  columns: { name: string; value: string }[] = [
    { name: "Shift", value: "shiftNo" },
    { name: "Clock In", value: "clockIn" },
    { name: "Clock Out", value: "clockOut" },
    { name: "Total Time", value: "totalTime" },
  ];
  dateToday: Date = new Date();
  selectedDate: Date | string | null = new Date();
  isLoading = false;
  userShiftDates: Date[] = [];

  constructor(
    private shiftsService: ShiftService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getShiftsByEmployeeAndStartDate(this.dateToday.getTime(), this.employee.id);
  }

  getShiftsByEmployeeAndStartDate(startDate: number, employeeId: string): void {
    this.isLoading = true;
    this.shiftsService
      .getShiftsByEmployeeAndStartDate(startDate, employeeId)
      .pipe(first())
      .subscribe(({ shifts, dates }) => {
        this.userShiftDates = Array.from(dates).map((date) => new Date(date));
        this.employeeShiftsOnDate = shifts.map((shift) => {
          const clockIn = new Date(shift.clockIn);
          const clockOut = new Date(shift.clockOut);

          return {
            ...shift,
            shiftNo: this.calculateShiftNumber(clockOut),
            clockIn: new DatePipe("en-US").transform(clockIn, "HH:mm"),
            clockOut: new DatePipe("en-US").transform(clockOut, "HH:mm"),
            totalTime: this.calculateTotalTime(clockIn, clockOut),
          };
        });
        this.isLoading = false;
        this.cdRef.detectChanges();
      });
  }

  calculateTotalTime(clockIn: Date, clockOut: Date): string {
    const totalTime = new Date(Math.abs(clockIn.getTime() - clockOut.getTime()));
    return totalTime.getUTCHours() + "h " + totalTime.getUTCMinutes() + "m";
  }

  calculateShiftNumber(clockOut: Date): number {
    return clockOut.getHours() <= 8 ? 1 : clockOut.getHours() > 8 && clockOut.getHours() <= 16 ? 2 : 3;
  }

  onShiftEdit(shift: {
    shiftNo: number;
    id: string;
    employeeId: string;
    clockIn: string | null;
    clockOut: string | null;
    totalTime: string | null;
  }): void {
    this.shiftsEdited.emit(shift);
  }

  highlightDatesWithShifts: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === "month") {
      const date = cellDate.toDateString();
      return this.userShiftDates.find((shiftDate) => shiftDate.toDateString() === date) ? "custom-date-class" : "";
    }
    return "";
  };

  getEmployeesForDate(date: Date | null): void {
    this.selectedDate = date?.toDateString() === this.dateToday.toDateString() ? "Today" : date;
    this.getShiftsByEmployeeAndStartDate(date?.getTime() || 0, this.employee.id);
  }
}
