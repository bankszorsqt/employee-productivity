export interface Employee {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  hourlyRateOvertime: number;
}

export interface EmployeePayment extends Employee {
  clockedIn: number;
  regularPay: number;
  overtimePay: number;
}
