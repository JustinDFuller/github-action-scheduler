import * as core from "@actions/core";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import { Config, Schedule, Day, DAYS } from "./config";

const words = /\w/g;

function formatOutput(input: string): string {
  let output: string = "";

  for (const s of input) {
    if (!s.match(words)) {
      output += "_";
    } else {
      output += s;
    }
  }

  output = output.replace(/_+/g, "_");

  if (output.endsWith("_")) {
    output = output.slice(0, output.length - 1);
  }

  if (output.startsWith("_")) {
    output = output.slice(1);
  }

  return output.toUpperCase();
}

async function main() {
  try {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const configString = core.getInput("config");
    if (!configString) {
      throw new Error(`Expected a config string input. Got: "${configString}`);
    }

    core.debug(`Schedule Config: ${configString}`);

    const config: Config = JSON.parse(configString);

    if (!config || !config.schedules || config.schedules.length === 0) {
      throw new Error("No Schedule Found.");
    }

    core.debug(`Parsed Config: ${JSON.stringify(config, null, 2)}`);

    for (const schedule of config.schedules) {
      if (!schedule.name) {
        throw new Error(
          `Missing Schedule Name: ${JSON.stringify(schedule, null, 2)}`,
        );
      }

      core.debug(`Processing "${schedule.name}"`);

      const now = dayjs().tz(config.timeZone);

      if (!("date" in schedule) && !("days" in schedule)) {
        throw new Error(
          "A schedule must container either a date or days. Found neither.",
        );
      }

      let matched = false;

      if ("dates" in schedule) {
        if (schedule.dates.length === 0) {
          throw new Error(
            "At least one date must be provided in the dates field.",
          );
        }

        for (const date of schedule.dates) {
          const start = dayjs(date, "YYYY-MM-DD")
            .tz(config.timeZone)
            .hour(schedule.startHour);
          const end = dayjs(date, "YYYY-MM-DD")
            .tz(config.timeZone)
            .hour(schedule.endHour);

          if (now.isAfter(start) && now.isBefore(end)) {
            matched = true;
          }
        }
      }

      if ("days" in schedule) {
        if (schedule.days.length === 0) {
          throw new Error(
            "At least one day must be provided in the days field",
          );
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
            matched = true;
          }
        }
      }

      if (matched) {
        core.notice(
          `The schedule "${schedule.name}" IS matched. You can access it as "steps.{ STEP_ID }.outputs.${formatOutput(schedule.name)}".`,
        );
        core.setOutput(formatOutput(schedule.name), true);
      } else {
        core.notice(
          `The schedule "${schedule.name}" is NOT matched. You can access it as "steps.{ STEP_ID }.outputs.${formatOutput(schedule.name)}".`,
        );
        core.setOutput(formatOutput(schedule.name), false);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
