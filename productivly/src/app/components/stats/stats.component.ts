import {Component} from "@angular/core";
import {MatCardModule} from "@angular/material/card";

@Component({
  selector: "app-stats",
  standalone: true,
  imports: [MatCardModule],
  templateUrl: "./stats.component.html",
  styleUrl: "./stats.component.scss",
})
export class StatsComponent {
}
