import { Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  // {
  //   path: "bulk-update",
  //   loadChildren: () => import("./components/bulk-edit-employees/bulk-edit-employees.component").then((m) => m.BulkEditEmployeesComponent),
  // },
];
