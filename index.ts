import * as core from "@actions/core";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import { Config, Schedule, Day, DAYS } from "./schedule";

async function main() {
  try {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const branch = core.getInput("branch");
    if (!branch) {
      throw new Error(`Expected a branch to lock. Got: "${branch}"`);
    }

    const scheduleString = core.getInput("schedule");
    if (!scheduleString) {
      throw new Error(
        `Expected a schedule string input. Got: "${scheduleString}`,
      );
    }

    core.notice(`Branch: ${branch}`);
    core.notice(`Schedule File Path: ${scheduleString}`);

    const config: Config = JSON.parse(scheduleString);

    if (!config || !config.schedules || config.schedules.length === 0) {
      throw new Error("No Schedule Found.");
    }

    core.notice(`Schedules: ${JSON.stringify(config.schedules, null, 2)}`);

    for (const s of config.schedules) {
      const schedule: Schedule = s;

      if (!schedule.name) {
        throw new Error(
          `Missing Lock Name: ${JSON.stringify(schedule, null, 2)}`,
        );
      }

      core.notice(`Processing "${schedule.name}"`);

      if (!schedule.days) {
        throw new Error(`Missing Lock days: ${schedule.name}`);
      }

      for (const d of schedule.days) {
        const day: Day = d;

        if (!day) {
          throw new Error(`Expected a day, got: "${day}`);
        }

        core.notice(`Processing "${schedule.name}"."${day}"`);

        if (!Day[day]) {
          throw new Error(
            `Unexpected day: "${day}". Acceptable options are: ${JSON.stringify(Day, null, 2)}. Days are case-sensitive.`,
          );
        }

        const now = dayjs().tz(config.timeZone);
        const wantDay = DAYS.find((d) => d === day);
        const gotDay = DAYS[now.day()];

        if (wantDay !== gotDay) {
          core.notice(`Day not matched: want=${wantDay} got=${gotDay}`);

          continue;
        }

        core.notice(`Day matched: want=${wantDay} got=${gotDay}`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
