import { Component, Input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { StatCardComponent } from "../stat-card/stat-card.component";

@Component({
  selector: "app-stats",
  standalone: true,
  imports: [MatCardModule, CommonModule, StatCardComponent],
  templateUrl: "./stats.component.html",
  styleUrl: "./stats.component.scss",
})
export class StatsComponent {
  @Input() totalEmployees = 0;
  @Input() totalClockedInTime = "--:--:--";
  @Input() totalRegularPaidAmount = 0;
  @Input() totalOvertimePaidAmount = 0;
}
