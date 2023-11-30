import {ComponentFixture, TestBed} from "@angular/core/testing";

import {BulkEditEmployeesComponent} from "./bulk-edit-employees.component";

describe("BulkEditEmployeesComponent", () => {
  let component: BulkEditEmployeesComponent;
  let fixture: ComponentFixture<BulkEditEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkEditEmployeesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BulkEditEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
