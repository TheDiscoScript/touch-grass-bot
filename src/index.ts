import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/db';
import { setupEvents } from './discord/events';
import { setupCronJobs } from './cron';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', async () => {
    await connectToDatabase();
    setupEvents(client);
    setupCronJobs(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
