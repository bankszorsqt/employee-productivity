import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "formatHours",
  standalone: true,
})
export class FormatHoursPipe implements PipeTransform {
  transform(hours: number): string {
    const hoursString = Math.floor(hours).toString();
    const minutesString = Math.floor((hours - Math.floor(hours)) * 60).toString();
    return `${hoursString}h ${minutesString}m`;
  }
}
