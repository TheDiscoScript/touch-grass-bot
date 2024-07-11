import { Client, TextChannel } from 'discord.js';
import { log } from '../utils';
import dotenv from 'dotenv';

export async function sendReport(client: Client, report: string) {
    const channel = client.channels.cache.get(process.env.REPORT_CHANNEL_ID!) as TextChannel;
    if (channel) {
        await channel.send(report);
        log('Monthly report sent');
    } else {
        log('Report channel not found');
    }
}
