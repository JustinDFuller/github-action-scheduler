const fs = require('fs/promises');
const core = require('@actions/core');
// const github = require('@actions/github');

async function main() {
    try {
        const branch = core.getInput('branch');
        if (!branch) {
            throw new Error(`Expected a branch to lock. Got: "${branch}"`);
        }
    
        const scheduleFilePath = core.getInput('schedule-file-path');
        if (!scheduleFilePath) {
            throw new Error(`Expected a schedule file path. Got: "${scheduleFilePath}`);
        }
    
        core.notice(`Branch: ${branch}`);
        core.notice(`Schedule File Path: ${scheduleFilePath}`);
    
        const scheduleFile = await fs.readFile(scheduleFilePath, 'utf-8')
    
        core.notice(`Schedule file: ${scheduleFile}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();