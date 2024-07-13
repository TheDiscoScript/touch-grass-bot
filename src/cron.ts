import cron from 'node-cron';
import { log } from './utils';
import { getAllUsers, resetMonthlyDataForAll, resetWeeklyDataForAll } from './db/db';
import { sendReport } from './discord/actions';
import { Client } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

export function setupCronJobs(client: Client) {
    //monthly
    cron.schedule('0 0 1 * *', async () => {
        log('Cron job started: Start of the first day of the month');

        await announcePastMonthResults(client);
        await resetMonthlyData();

        log('Cron job ended: Start of the first day of the month');
    });

    //weekly
    cron.schedule('0 0 * * 1', async () => {
        log('Cron job started: Start of the first day of the week');

        await announcePastWeekResults(client);
        await resetWeeklyData();

        log('Cron job ended: Start of the first day of the week');
    });
}

async function announcePastMonthResults(client: Client) {
    const channelId = process.env.REPORT_CHANNEL_ID;
    log('Announcing past month results');
    const users = await getAllUsers();

    //descending order
    users.sort((a, b) => b.thisMonthMinutes - a.thisMonthMinutes);

    let report = 'Monthly Voice Channel Usage:\n';
    users.forEach((user) => {
        report += `${user.userName}: ${user.thisMonthMinutes} minutes\n`;
    });

    await sendReport(client, report, channelId!);
    log('Announced past month results');
}

async function announcePastWeekResults(client: Client) {
    const channelId = process.env.REPORT_CHANNEL_WEEKLY_ID;

    log('Announcing past week results');
    const users = await getAllUsers();

    //descending order
    users.sort((a, b) => b.thisWeekMinutes - a.thisWeekMinutes);

    let report = 'Weekly Voice Channel Usage:\n';
    users.forEach((user) => {
        report += `${user.userName}: ${user.thisWeekMinutes} minutes\n`;
    });

    await sendReport(client, report, channelId!);
    log('Announced past week results');
}
async function resetMonthlyData() {
    log('Resetting monthly data');
    resetMonthlyDataForAll();
    log('Monthly data reseted');
}
async function resetWeeklyData() {
    log('Resetting weekly data');
    resetWeeklyDataForAll();
    log('Weekly data reseted');
}
