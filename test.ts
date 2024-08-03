import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Config, Day, DAYS, validDateFormats } from "./config";
import { process as processor } from "./process";
import type { Logger } from "./logger";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

dayjs.tz.setDefault("America/New_York");

type Test = {
  name: string;
  now: dayjs.Dayjs;
  expected: boolean;
  wantScheduleMatch?: string;
};

const exampleConfig: Config = {
  timeZone: "America/New_York",
  schedules: [
    {
      name: "UNLOCK",
      days: [Day.monday, Day.tuesday, Day.wednesday, Day.thursday, Day.friday],
      startHour: 9,
      endHour: 18,
    },
    {
      name: "LOCK_WEEKDAYS",
      days: [Day.monday, Day.tuesday, Day.wednesday, Day.thursday, Day.friday],
      startHour: 18,
      endHour: 23,
    },
    {
      name: "LOCK_WEEKENDS",
      days: [Day.saturday, Day.sunday],
      startHour: 0,
      endHour: 23,
    },
    {
      name: "LOCK_CUSTOM_DAY",
      dates: ["2024-07-26"],
      startHour: 0,
      endHour: 23,
    },
    {
      name: "LOCK_EARLY_DISMISSAL",
      dates: [
        "2024-08-02",
        "2024-08-09",
        "2024-08-16",
        "2024-08-23",
        "2024-08-30",
      ],
      startHour: 14,
      endHour: 23,
    },
  ],
};

const tests: Test[] = [
  {
    name: "matches day of week",
    now: dayjs.tz("2021-02-08T09:00:00", "America/New_York"),
    expected: true,
    wantScheduleMatch: "UNLOCK",
  },
  {
    name: "matches day of week but before start hour",
    now: dayjs.tz("2021-02-08", "America/New_York"),
    expected: false,
  },
  {
    name: "matches day of week but after end hour",
    now: dayjs.tz("2021-02-08T19:00:00", "America/New_York"),
    expected: true,
    wantScheduleMatch: "LOCK_WEEKDAYS",
  },
  {
    name: "matches weekend",
    now: dayjs.tz("2021-09-04", "America/New_York"),
    expected: true,
    wantScheduleMatch: "LOCK_WEEKENDS",
  },
  {
    name: "matches custom day",
    now: dayjs.tz("2024-07-26", "America/New_York"),
    expected: true,
    wantScheduleMatch: "LOCK_CUSTOM_DAY",
  },
  {
    name: "matches early dismissal",
    now: dayjs.tz("2024-08-09T15:00:00", "America/New_York"),
    expected: true,
    wantScheduleMatch: "LOCK_EARLY_DISMISSAL",
  },
  {
    name: "matches early dismissal in GMT",
    now: dayjs()
      .year(2024)
      .month(7)
      .date(9)
      .hour(18)
      .minute(0)
      .second(0)
      .tz("GMT", true),
    expected: true,
    wantScheduleMatch: "LOCK_EARLY_DISMISSAL",
  },
];

let failed = false;

for (const test of tests) {
  console.log("\x1b[1m%s\x1b[0m", test.name);
  console.log(test.now.toString());

  const results: any = {};

  const logger: Logger = {
    debug: (message: string) => {},
    notice: (message: string) => {},
    fail: (message: string) => {},
    setOutput: (name: string, value: any) => {
      results[name] = value;
    },
  };

  const actual = processor(test.now, exampleConfig, logger);
  if (actual !== test.expected) {
    console.log("\x1b[31m%s\x1b[0m", "FAIL");
    console.log("Wanted:", test.expected, "Got:", actual, "\n");
    failed = true;
  }

  if (!failed && test.wantScheduleMatch) {
    if (results[test.wantScheduleMatch] !== true) {
      console.log("\x1b[31m%s\x1b[0m", "FAIL");
      console.log(
        "Expected",
        test.wantScheduleMatch,
        "to be true, but got",
        results[test.wantScheduleMatch],
        "\n",
      );
      failed = true;
    }
  }

  if (!failed) {
    console.log("\x1b[32m%s\x1b[0m", "PASS\n");
  }
}

if (failed) {
  process.exit(1);
}
