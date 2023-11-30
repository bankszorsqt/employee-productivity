import {Routes} from "@angular/router";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {BulkEditEmployeesComponent} from "./components/bulk-edit-employees/bulk-edit-employees.component";

export const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    children: [
      {
        path: "bulk-update",
        component: BulkEditEmployeesComponent,
      },
    ],
  },
];
