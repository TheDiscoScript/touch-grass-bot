import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { connectToDatabase } from './db';
import { setupEvents } from './events';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', async () => {
    await connectToDatabase();
    setupEvents(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
