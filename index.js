const fs = require("fs/promises");
const core = require("@actions/core");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

async function main() {
  try {
    const branch = core.getInput("branch");
    if (!branch) {
      throw new Error(`Expected a branch to lock. Got: "${branch}"`);
    }

    const scheduleFilePath = core.getInput("schedule-file-path");
    if (!scheduleFilePath) {
      throw new Error(
        `Expected a schedule file path. Got: "${scheduleFilePath}`,
      );
    }

    core.notice(`Branch: ${branch}`);
    core.notice(`Schedule File Path: ${scheduleFilePath}`);

    const scheduleFile = await fs.readFile(scheduleFilePath, "utf-8");

    core.notice(`Schedule file: ${scheduleFile}`);

    const schedule = JSON.parse(scheduleFile);

    if (!schedule || !schedule.locks || schedule.locks.length === 0) {
      throw new Error("No Lock Schedule Found.");
    }

    core.notice(`Schedules: ${JSON.stringify(schedule.locks, null, 2)}`);

    for (const lock of schedule.locks) {
      if (!lock.name) {
        throw new Error(`Missing Lock Name: ${JSON.stringify(lock, null, 2)}`);
      }

      core.notice(`Processing "${lock.name}`);

      if (!lock.days) {
        throw new Error(`Missing Lock days: ${lock.name}`);
      }

      for (const day of lock.days) {
        if (!day) {
          throw new Error(`Expected a day, got: "${day}`);
        }

        core.notice(`Processing ${day}`);

        if (!DAYS[day.toLowerCase()]) {
          throw new Error(
            `Unexpected day: "${day}. Acceptable options are: ${JSON.stringify(DAYS, null, 2)}`,
          );
        }

        let startDay = daysjs();
        if (day.startTimeZone) {
          startDay = startDay.tz(startTimeZone);
        }

        startDay = DAYS[startDay.getDay()];

        let endDay = daysjs();
        if (day.startTimeZone) {
          endDay = endDay.tz(startTimeZone);
        }

        endDay = DAYS[endDay.getDay()];

        if (startDay !== day && endDay !== day) {
          core.notice(`StartDay=${startDay} EndDay=${endDay} day=${day}`);
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
