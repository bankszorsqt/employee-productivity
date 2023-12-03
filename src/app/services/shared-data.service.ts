import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SharedDataService {

  private refreshSource = new BehaviorSubject(<boolean>false);
  currentRefreshState = this.refreshSource.asObservable();

  refreshData(isRefresh: boolean): void {
    this.refreshSource.next(isRefresh);
  }
}
