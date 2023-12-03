import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UtilService {

  public static updateArrayItemIfExists<T extends { id: string }>(array: T[], newItem: T): void {
    const existingIndex = array.findIndex((existingItem) => newItem.id === existingItem.id);

    if (existingIndex !== -1) {
      array[existingIndex] = newItem;
    } else {
      array.push(newItem);
    }
  }
}
