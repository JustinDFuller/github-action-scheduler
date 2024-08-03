import * as core from "@actions/core";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Config, Day, DAYS, validDateFormats } from "./config";
import type { Logger } from "./logger";
import { process } from "./process";

const logger: Logger = {
  debug: (message: string) => {
    core.debug(message);
  },
  notice: (message: string) => {
    core.notice(message);
  },
  fail: (message: string) => {
    core.setFailed(message);
  },
  setOutput: (name: string, value: any) => {
    core.setOutput(name, value);
  },
};

async function main() {
  try {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(customParseFormat);
    dayjs.extend(isSameOrBefore);
    dayjs.extend(isSameOrAfter);

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

    dayjs.tz.setDefault(config.timeZone || "America/New_York");
    process(dayjs(), config, logger);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
