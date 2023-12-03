import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Employee, EmployeePayment } from "../../../models/employee.model";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { EditShiftComponent } from "../edit-shift/edit-shift.component";

@Component({
  selector: "app-edit-employee",
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, EditShiftComponent],
  templateUrl: "./edit-employee.component.html",
  styleUrl: "./edit-employee.component.scss",
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEmployeeComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  @Input() employee!: EmployeePayment;
  @Input() index!: number;
  @Output() employeesEdited = new EventEmitter<Employee>();

  employeeForm = this.fb.group({
    id: "",
    email: "",
    name: ["A", Validators.required],
    hourlyRate: [0, Validators.required],
    hourlyRateOvertime: [0, Validators.required],
  });

  ngOnInit(): void {
    this.employeeForm.patchValue(this.employee);
    this.listenForChangesAndEmit();
  }

  listenForChangesAndEmit(): void {
    this.employeeForm.valueChanges.subscribe((employeeFormValue) => {
      if (this.employeeForm.valid && this.employeeForm.dirty) {
        this.employeesEdited.emit(employeeFormValue as Employee);
      }
    });
  }
}
