# Github Action Scheduler

[![GitHub Actions Demo](https://github.com/JustinDFuller/github-action-scheduler/actions/workflows/demo.yml/badge.svg)](https://github.com/JustinDFuller/github-action-scheduler/actions/workflows/demo.yml)
[![Tests](https://github.com/JustinDFuller/github-action-scheduler/actions/workflows/tests.yml/badge.svg)](https://github.com/JustinDFuller/github-action-scheduler/actions/workflows/tests.yml)

Github Action to run a Schedule.

## Explanation

This is a general-purpose scheduling action. While it does not *do* anything with the schedule, it outputs variables that allow you to run subsequent steps on a schedule.

## Features

The scheduling mechanism in this action is simple, yet powerful.

### Schedule IDs

When you execute this action, you *must* give the step an `id` to allow access to the step outputs.

So, by assigning the step with: `id: schedule`, you will be able to access the outputs as `${{ steps.schedule.outputs.EXAMPLE }}`.

This means you can run multiple schedules, each with a unique ID.

### Named Schedules

Each schedule has a `name` property. This `name` is used as an output for the step. If the schedule matches the current date and time, the `name` output will be `'true'`. Otherwise, it will be `'false'`.

In your config JSON, you will define each schedule with a `name` property.

```json
{
    "name": "example",
},
```

The name will convert to "screaming snake case", which is `snake_case` with all capital letters. So, `example`, will convert to `EXAMPLE`.

For your convenience, the action prints how to access the output in the logs.

In your workflow yaml, you access it by utilizing the `if` property of a subsequent step.

```yaml
if: ${{ steps.schedule.outputs.EXAMPLE == 'true' }}
if: ${{ steps.schedule.outputs.EXAMPLE != 'true' }}
if: ${{ steps.schedule.outputs.EXAMPLE == 'false' }}
if: ${{ steps.schedule.outputs.EXAMPLE != 'false' }}
```

### Day Schedules

You can define a schedule based on the day(s) of the week. This is useful for recurring events that happen on a particular day of the week.

```json
{
  "name": "weekdays",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
},
{
  "name": "weekends",
  "days": ["saturday", "sunday"]
}
```

### Date Schedules

You can define date schedules. This is useful for one-off events that happen on specific days, such as holidays.

```json
{
  "name": "holidays",
  "dates": ["2024-07-04", "2024-12-25"]
}
```

Dates can use one of these formats. The date parser requires an exact match, so you cannot include any extra characters and you cannot use any delimiter except "-".

| Format     | Example    | Description                                                 |
|------------|------------|-------------------------------------------------------------|
| YYYY-MM-DD | 2024-07-04 | Run this schedule on this year, month, and day. No repeats. |
| MM-DD      | 07-04      | Run this schedule on this month and day. Repeat each year.  |
| DD         | 04         | Run this schedule on this day. Repeat each month.           |

Each field within the date uses the following formats.

| Format | Allowed Values | Description                                                              |
|--------|----------------|--------------------------------------------------------------------------|
| YYYY   | 0001-9999      | The year. Must be 4 digits. Prefix with one or more 0s if less than 999. |
| MM     | 01-12          | The month. Must be 2 digits. Prefix with 0 if less than 10.              |
| DD     | 01-31          | The day. Must be 2 digits. Prefix with 0 if less than 10.                |

## Example

### Schedule JSON

Here is an example JSON scheduled. Save it as a [Repository Github Variable](https://docs.github.com/en/actions/learn-github-actions/variables).

```json
{
  "timeZone": "America/New_York",
  "schedules": [
    {
      "name": "unlock",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startHour": 9,
      "endHour": 18
    },
    {
      "name": "lock (weekends)",
      "days": ["saturday", "sunday"],
      "startHour": 0,
      "endHour": 24
    },
    {
      "name": "lock (custom)",
      "dates": ["2024-07-26"],
      "startHour": 0,
      "endHour": 24
    }
  ]
}
```

The schema for the schedule JSON is in [`config.ts`](./config.ts).

### Workflow YAML

Here is a sample Workflow YAML Configuration. It shows:

1. How to run the schedule on a cron timer, when pushing to a branch, or manually using workflow dispatch.
2. How to pass in the scheduled stored as a Github Variable.
3. How to access the outputs.

```yaml
name: Example

on:
  schedule:
    - cron: "0 * * * *" # Every Hour
  push:
    branches:
      - main # On push to main branch
  workflow_dispatch: # Run Manually with workflow dispatch

jobs:
  Schedule:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository code
        uses: actions/checkout@v4

      - name: Schedule Branch Lock
        id: schedule # Make sure to give it an ID
        uses: JustinDFuller/schedule@v2
        with:
          config: ${{ vars.SCHEDULE }} # Pass in the Schedule Variable

      # Print the outputs of the above example schedule.
      - run: echo steps.schedule.outputs.UNLOCK=${{ steps.schedule.outputs.UNLOCK }}
      - run: echo steps.schedule.outputs.LOCK_WEEKENDS=${{ steps.schedule.outputs.LOCK_WEEKENDS }}
      - run: echo steps.schedule.outputs.LOCK_CUSTOM=${{ steps.schedule.outputs.LOCK_CUSTOM }}
```

There is a working demo in [.github/workflows/demo.yml](.github/workflows/demo.yml). You can see sample outputs [here](https://github.com/JustinDFuller/schedule/actions/workflows/demo.yml).

## Examples

### Annotations

![Screenshot 2024-07-27 11 43 10 AM](https://github.com/user-attachments/assets/4979940d-66fc-4a0b-9714-5a7f565c15b4)

### Logs

![Screenshot 2024-07-27 11 45 34 AM](https://github.com/user-attachments/assets/431455fe-78fb-4ff6-860b-c57975194fe8)

## Guide

### Add a Schedule using Github Variables

1. Open the `settings` page for your repository.

<p align="center">
    <img alt="Repository Menu" src="https://github.com/user-attachments/assets/080a2fe3-5901-4251-bf33-546c1ed3b5cb" width="350px" />
</p>

2. On the left-hand navigation menu, navigate to `Secrets and Variables` -> `Actions`.

<p align="center">
    <img alt="Left-Hand navigation menu" src="https://github.com/user-attachments/assets/307e8604-6c13-4e2b-b3c4-87099bc70f9c" width="350px" />
</p>

3. Switch to the `Variables` tab.

<p align="center">
    <img alt="Tabs" src="https://github.com/user-attachments/assets/4acd2ca5-f476-4118-9fd2-d64d13ba9987" width="350px" />
</p>

4. Click `New Repository Variable`.

<p align="center">
    <img alt="Variables Menu" src="https://github.com/user-attachments/assets/2bb438ed-28d9-4578-80f6-433e100a5c99" width="350px" />
</p>

5. In the `Name` field, enter the name you want to use to access this variable in your Github Action. In the `Value` field, enter the Schedule Config JSON.

<p align="center">
    <img alt="Variables Form" src="https://github.com/user-attachments/assets/9a074e64-6fc8-4339-8666-eac8f604c246" width="350px" />
</p>

Click Save. This example variable would be available as `${{ var.SCHEDULE }}`.
