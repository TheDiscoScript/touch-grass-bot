import { Client, TextChannel } from 'discord.js';
import { log } from '../utils';

export async function sendReport(client: Client, report: string, channelId: string) {
    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (channel) {
        await channel.send(report);
        log('Report sent');
    } else {
        log('Report channel not found');
    }
}
