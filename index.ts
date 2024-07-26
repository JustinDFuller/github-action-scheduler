import { promises as fs } from "fs";
import * as core from "@actions/core";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import { Schedule, Day, DAYS } from "./schedule";

async function main() {
  try {
    dayjs.extend(utc);
    dayjs.extend(timezone);

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

    const schedule: Schedule = JSON.parse(scheduleFile);

    if (!schedule || !schedule.locks || schedule.locks.length === 0) {
      throw new Error("No Lock Schedule Found.");
    }

    core.notice(`Schedules: ${JSON.stringify(schedule.locks, null, 2)}`);

    for (const lock of schedule.locks) {
      if (!lock.name) {
        throw new Error(`Missing Lock Name: ${JSON.stringify(lock, null, 2)}`);
      }

      core.notice(`Processing "${lock.name}"`);

      if (!lock.days) {
        throw new Error(`Missing Lock days: ${lock.name}`);
      }

      for (const day of lock.days) {
        if (!day) {
          throw new Error(`Expected a day, got: "${day}`);
        }

        core.notice(`Processing "${lock.name}"."${day}"`);

        if (!Day[day]) {
          throw new Error(
            `Unexpected day: "${day}". Acceptable options are: ${JSON.stringify(Day, null, 2)}. Days are case-sensitive.`,
          );
        }

        let startDate = dayjs();
        if (lock.startTimeZone) {
          startDate = startDate.tz(lock.startTimeZone);
        }

        const startDay = DAYS[startDate.day()];
        if (!startDay) {
          throw new Error(`Unexpected Start Day: ${startDate.day()}`);
        }

        let endDate = dayjs();
        if (lock.endTimeZone) {
          endDate = endDate.tz(lock.endTimeZone);
        }

        const endDay = DAYS[endDate.day()];
        if (!endDay) {
          throw new Error(`Unexpected Start Day: ${endDate.day()}`);
        }

        const wantDay = DAYS[day];

        if (startDay !== wantDay && endDay !== wantDay) {
          core.notice(
            `Day not matched. StartDay=${startDay} EndDay=${endDay} day=${wantDay}`,
          );

          continue;
        }

        core.notice(
          `Day matched. StartDay=${startDay} EndDay=${endDay} day=${wantDay}`,
        );
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
