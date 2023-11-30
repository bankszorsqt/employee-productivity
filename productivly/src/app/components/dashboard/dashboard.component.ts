import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {StatsComponent} from "../stats/stats.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterOutlet, StatsComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
}
