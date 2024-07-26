import * as core from "@actions/core";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import { Config, Schedule, Day, DAYS } from "./schedule";

async function main() {
  try {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const configString = core.getInput("schedule");
    if (!configString) {
      throw new Error(
        `Expected a schedule string input. Got: "${configString}`,
      );
    }

    core.debug(`Schedule Config: ${configString}`);

    const config: Config = JSON.parse(configString);

    if (!config || !config.schedules || config.schedules.length === 0) {
      throw new Error("No Schedule Found.");
    }

    core.debug(`Parsed Config: ${JSON.stringify(config, null, 2)}`);

    for (const s of config.schedules) {
      const schedule: Schedule = s;

      if (!schedule.name) {
        throw new Error(
          `Missing Schedule Name: ${JSON.stringify(schedule, null, 2)}`,
        );
      }

      core.debug(`Processing "${schedule.name}"`);

      if (!schedule.days) {
        throw new Error(`Missing Lock days: ${schedule.name}`);
      }

      for (const d of schedule.days) {
        const day: Day = d;

        if (!day) {
          throw new Error(`Expected a day, got: "${day}`);
        }

        core.debug(`Processing "${schedule.name}"."${day}"`);

        if (!Day[day]) {
          throw new Error(
            `Unexpected day: "${day}". Acceptable options are: ${JSON.stringify(Day, null, 2)}. Days are case-sensitive.`,
          );
        }

        const now = dayjs().tz(config.timeZone);
        const wantDay = DAYS.find((d) => d === day);
        const gotDay = DAYS[now.day()];

        if (wantDay !== gotDay) {
          core.debug(`Day not matched: want=${wantDay} got=${gotDay}`);

          continue;
        }

        core.debug(`Day matched: want=${wantDay} got=${gotDay}`);

        const start = dayjs().tz(config.timeZone).hour(schedule.startHour);
        const end = dayjs().tz(config.timeZone).hour(schedule.endHour);

        if (now.isAfter(start) && now.isBefore(end)) {
          core.notice(
            `The schedule ${schedule.name} on day ${day} is matched.`,
          );
          core.setOutput(schedule.name, true);
        } else {
          core.notice(
            `The schedule ${schedule.name} on day ${day} is not matched.`,
          );
          core.setOutput(schedule.name, false);
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
