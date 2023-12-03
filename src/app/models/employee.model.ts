import { Shift } from "./shift.model";

export interface Employee {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  hourlyRateOvertime: number;
}

export interface EmployeePayment extends Employee {
  clockedInTotal: number;
  regularPay: number;
  overtimePay: number;
  shifts?: Shift[];
}

export interface TableOptions {
  pageIndex: number;
  pageSize: number;
  order: string;
}
