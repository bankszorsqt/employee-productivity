import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditShiftComponent } from "./edit-shift.component";

describe("EditShiftComponent", () => {
  let component: EditShiftComponent;
  let fixture: ComponentFixture<EditShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditShiftComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
