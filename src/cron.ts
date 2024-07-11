import cron from 'node-cron';
import { log } from './utils';
import { getAllUsers, resetMonthlyDataForAll } from './db/db';
import { sendReport } from './discord/actions';
import { Client } from 'discord.js';

export function setupCronJobs(client: Client) {
    cron.schedule('0 0 1 * *', async () => {
        log('Cron job started: Start of the first day of the month');

        await announcePastMonthResults(client);
        await resetMonthlyData();

        log('Cron job ended: Start of the first day of the month');
    });
}

async function announcePastMonthResults(client: Client) {
    log('Announcing past month results');
    const users = await getAllUsers();

    //descending order
    users.sort((a, b) => b.thisMonthMinutes - a.thisMonthMinutes);

    let report = 'Monthly Voice Channel Usage:\n';
    users.forEach((user) => {
        report += `${user.userName}: ${user.thisMonthMinutes} minutes\n`;
    });

    await sendReport(client, report);
    log('Announced past month results');
}
async function resetMonthlyData() {
    log('Resetting monthly data');
    resetMonthlyDataForAll();
    log('Monthly data reseted');
}
