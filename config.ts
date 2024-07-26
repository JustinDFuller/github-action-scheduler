export type Config = {
  readonly timeZone: string;
  readonly schedules: Schedule[];
};

export type Schedule = {
  readonly name: string;
  readonly days: Day[];
  readonly startHour: number;
  readonly endHour: number;
};

export enum Day {
  sunday = "sunday",
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
}

export const DAYS: string[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
