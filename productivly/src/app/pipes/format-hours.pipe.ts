import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "formatHours",
  standalone: true,
})
export class FormatHoursPipe implements PipeTransform {
  transform(hours: number): string {
    const totalMinutes = hours * 60;
    if (!totalMinutes) return `0`;
    const minutes = (hours * 60) % 60;
    const h = hours > 0 ? `${hours?.toFixed()}h` : "";
    const m = minutes > 0 ? ` ${minutes?.toFixed()}m` : "";
    return `${h} ${m}`;
  }
}
