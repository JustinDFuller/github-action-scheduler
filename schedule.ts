export type Schedule = {
  readonly locks: Lock[];
};

export type Lock = {
  readonly name: string;
  readonly days: Day[];
  readonly startHour: number;
  readonly startTimeZone?: string;
  readonly endHour: number;
  readonly endTimeZone?: string;
};

export enum Day {
  sunday,
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
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
