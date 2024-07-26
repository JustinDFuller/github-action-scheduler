const fs = require("fs/promises");
const core = require("@actions/core");
// const github = require('@actions/github');

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

    core.debug(`Branch: ${branch}`);
    core.debug(`Schedule File Path: ${scheduleFilePath}`);

    const scheduleFile = await fs.readFile(scheduleFilePath, "utf-8");

    core.debug(`Schedule file: ${scheduleFile}`);

    const schedule = JSON.parse(scheduleFile);

    if (!schedule || !schedule.locks || schedule.locks.length === 0) {
      throw new Error("No Lock Schedule Found.");
    }

    core.debug(`Schedules: ${JSON.stringify(schedule.locks, null, 2)}`);

    for (const lock of schedule.locks) {
      if (!lock.days) {
        throw new Error(`Missing Lock days: ${lock}`);
      }

      core.notice(`Lock: ${lock}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
