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

// Catch general client errors, including WebSocket issues
client.on('error', (error) => {
    console.error('Client Error:', error);
});

// Handle login with retries
async function loginWithRetry(maxAttempts = 5) {
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            await client.login(process.env.DISCORD_BOT_TOKEN);
            console.log('Successfully connected to Discord');
            return;
        } catch (error) {
            attempts++;
            const backoffTime = Math.min(30000, 1000 * Math.pow(2, attempts)); // Exponential backoff (max 30s)
            console.error(`Login attempt ${attempts}/${maxAttempts} failed:`, error);

            if (attempts >= maxAttempts) {
                console.error('Maximum login attempts reached. Giving up.');
                process.exit(1); // Exit with error so Fly.io restarts the container
            }

            console.log(`Retrying in ${backoffTime / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
    }
}

// Start the login process
loginWithRetry();
