import { Client, VoiceState } from 'discord.js';
import { findUser, insertUser, updateUserTime } from '../db/db';
import crypto from 'crypto';
import { log } from '../utils';

const usersInVoiceChannels = new Set<string>();

export function setupEvents(client: Client) {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user?.tag}`);
    });

    client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
        const userId = newState.member?.user.id || oldState.member?.user.id;
        if (!userId) return;

        if (!oldState.channelId && newState.channelId) {
            let user = await findUser(userId);

            if (!user) {
                user = {
                    userId,
                    userName: newState.member!.user.tag,
                    id: crypto.randomBytes(16).toString('hex'),
                    totalMinutes: 0,
                    thisMonthMinutes: 0,
                    thisWeekMinutes: 0,
                };
                await insertUser(user);
                console.log(`Account created for ${newState.member!.user.tag}`);
            }

            usersInVoiceChannels.add(userId);
            log(`${newState.member?.user.tag} joined channel ${newState.channel?.name}`);
        }

        if (oldState.channelId && !newState.channelId) {
            usersInVoiceChannels.delete(userId);
            log(`${oldState.member?.user.tag} left channel ${oldState.channel?.name}`);
        }

        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            log(`${newState.member?.user.tag} switched from ${oldState.channel?.name} to ${newState.channel?.name}`);
        }
    });

    setInterval(updateUserTimes, 60000);
}

async function updateUserTimes() {
    for (const userId of usersInVoiceChannels) {
        await updateUserTime(userId);
        if (process.env.LOG === 'true') {
            const user = await findUser(userId);
            if (user) {
                log(
                    `Updated time for ${user.userName}: ${user.thisMonthMinutes + 1} minutes this month, ${user.totalMinutes + 1} minutes total., ${user.thisWeekMinutes + 1} minutes this week`,
                );
            }
        }
    }
}
