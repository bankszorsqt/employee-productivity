import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: "./stat-card.component.html",
  styleUrl: "./stat-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input() value: string | number | null = "0"
  @Input() title: string = "";
}
