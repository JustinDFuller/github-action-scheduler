// Config is the top-level object of the Schedule Config.
// This is the entire object you will save in your Github Variable.
export type Config = {
  // timeZone is REQUIRED and must be a valid IANA (otherwise known as tz) location string.
  // You can find a list of valid timeZone options here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  readonly timeZone: string;
  // schedules is REQUIRED and must adhere to the Schedule type defined below.
  // There MUST be at least one schedule.
  readonly schedules: Schedule[];
};

// There are two types of schedules.
// 1. A day-based schedule which looks for a particular day of the week. This is useful for defining weekdays and weekends.
// 2. A date-based schedule which looks for a particular date. This is useful for defining special events, such as a holiday schedule.
// If you do not adhere to either of these schedules, you will receive an error.
export type Schedule = DaySchedule | DateSchedule;

// ScheduleBase defines properties that are available for all schedule types.
type ScheduleBase = {
  // every schedule MUST define a name. This is the only way it is accessible through step outputs.
  // The name in the output will format as UPPER_SNAKE_CASE.
  readonly name: string;
  // startHour is the hour at the beginning of the window that the schedule can match.
  // valid inputs are 0-24.
  readonly startHour: number;
  // endHour is the end of the window that the schedule can match.
  // valid inputs are 0-24.
  readonly endHour: number;
};

// A Day schedule matches one or more days of the week.
// At least one day must be provided.
// For other fields, see ScheduleBase above.
export type DaySchedule = ScheduleBase & {
  // days defines the days this schedule will match.
  // valid entries are: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", and "sunday".
  readonly days: Day[];
};

// A Date schedule matches one or more dates.
// At least one date must be provided.
// For other fields, see ScheduleBase above.
export type DateSchedule = ScheduleBase & {
  // dates defines the dates this schedule will match.
  // valid entries adhere to the "YYYY-MM-DD" pattern such as "2024-01-31".
  // YYYY = year expressed by four digits.
  // MM = month expressed by two digits (using a leading 0 if required).
  // DD = day expressed by two digits (using a leading 0 if required).
  readonly dates: string[];
};

// Day defines valid Day inputs.
export enum Day {
  sunday = "sunday",
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
}

// Days provides a convenient mapping of day strings to numeric values.
// This also expresses the allowed day values.
export const DAYS: string[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
