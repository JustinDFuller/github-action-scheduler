import * as core from "@actions/core";
import * as dayjs from "dayjs";
import { Config, Day, DAYS, validDateFormats } from "./config";
import type { Logger } from "./logger";

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

export function process(
  now: dayjs.Dayjs,
  config: Config,
  logger: Logger,
): boolean {
  let anyMatched = false;

  for (const schedule of config.schedules) {
    if (!schedule.name) {
      throw new Error(
        `Missing Schedule Name: ${JSON.stringify(schedule, null, 2)}`,
      );
    }

    logger.debug(`Processing "${schedule.name}"`);

    if (!("dates" in schedule) && !("days" in schedule)) {
      throw new Error(
        "A schedule must container either a date or days. Found neither.",
      );
    }

    let matched = false;

    if ("dates" in schedule) {
      if (!Array.isArray(schedule.dates)) {
        throw new Error("The dates field must be an array.");
      }

      if (schedule.dates.length === 0) {
        throw new Error(
          "At least one date must be provided in the dates field.",
        );
      }

      for (const date of schedule.dates) {
        const start = dayjs(date, validDateFormats, true /* strict parsing */)
          .tz(config.timeZone, true)
          .add(schedule.startHour, "hour")
          .add(schedule.startMinute || 0, "minute")
          .add(schedule.startSecond || 0, "second");

        const end = dayjs(date, validDateFormats, true /* strict parsing */)
          .tz(config.timeZone, true)
          .add(schedule.endHour, "hour")
          .add(schedule.endMinute || 0, "minute")
          .add(schedule.endSecond || 0, "second");

        logger.debug(
          `Processing "${schedule.name}"."${date}" start=${start} end=${end}`,
        );

        if (!start.isValid()) {
          throw new Error(
            `Start date should follow one of the allowed date formats: ${JSON.stringify(validDateFormats, null, 2)}`,
          );
        }

        if (!end.isValid()) {
          throw new Error(
            `End date should follow one of the allowed date formats: ${JSON.stringify(validDateFormats, null, 2)}`,
          );
        }

        if (now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
          matched = true;
          logger.debug(`Date matched: now=${now} start=${start} end=${end}`);
        } else {
          logger.debug(
            `Date not matched: now=${now} start=${start} end=${end} nowIsAfterStart=${now.isSameOrAfter(start)} nowIsBeforeEnd=${now.isSameOrBefore(end)}`,
          );
        }
      }
    }

    if ("days" in schedule) {
      if (!Array.isArray(schedule.days)) {
        throw new Error("The days field must be an array.");
      }

      if (schedule.days.length === 0) {
        throw new Error("At least one day must be provided in the days field");
      }

      for (const d of schedule.days) {
        const day: Day = d;

        if (!day) {
          throw new Error(`Expected a day, got: "${day}`);
        }

        logger.debug(`Processing "${schedule.name}"."${day}"`);

        if (!Day[day]) {
          throw new Error(
            `Unexpected day: "${day}". Acceptable options are: ${JSON.stringify(Day, null, 2)}. Days are case-sensitive.`,
          );
        }

        const wantDay = DAYS.find((d) => d === day);
        const gotDay = DAYS[now.day()];

        if (wantDay !== gotDay) {
          logger.debug(`Day not matched: want=${wantDay} got=${gotDay}`);

          continue;
        }

        logger.debug(`Day matched: want=${wantDay} got=${gotDay}`);

        const start = now
          .tz(config.timeZone)
          .hour(schedule.startHour)
          .minute(schedule.startMinute || 0)
          .second(schedule.startSecond || 0);

        const end = now
          .tz(config.timeZone)
          .hour(schedule.endHour)
          .minute(schedule.endMinute || 0)
          .second(schedule.endSecond || 0);

        if (now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
          matched = true;
          logger.debug(`Day matched: now=${now} start=${start} end=${end}`);
        } else {
          logger.debug(
            `Day not matched: now=${now} start=${start} end=${end} nowIsAfterStart=${now.isSameOrAfter(start)} nowIsBeforeEnd=${now.isSameOrBefore(end)}`,
          );
        }
      }
    }

    if (matched) {
      anyMatched = true;
      logger.notice(
        `The schedule "${schedule.name}" IS matched. You can access it as "steps.{ STEP_ID }.outputs.${formatOutput(schedule.name)}".`,
      );
      logger.setOutput(formatOutput(schedule.name), true);
    } else {
      logger.notice(
        `The schedule "${schedule.name}" is NOT matched. You can access it as "steps.{ STEP_ID }.outputs.${formatOutput(schedule.name)}".`,
      );
      logger.setOutput(formatOutput(schedule.name), false);
    }
  }

  return anyMatched;
}
