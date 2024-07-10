import { Client, GatewayIntentBits } from 'discord.js';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// MongoDB connection
const clientMongo = new MongoClient(process.env.MONGODB_URI!);
let db: Db;
async function connectToDatabase() {
    await clientMongo.connect();
    db = clientMongo.db('discordBot');
    console.log('Connected to MongoDB');
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// In-memory database to store user data
const userDatabase = new Map<
    string,
    {
        userName: string;
        userId: string;
        id: string;
        totalMinutes: number;
        thisMonthMinutes: number;
    }
>();
const usersInVoiceChannels = new Set<string>();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    await connectToDatabase();

    setInterval(updateUserTimes, 10000); // Update user times every minute
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check if the user has joined a voice channel
    const userId = newState.member?.user.id;
    if (!userId) return;

    const userCollection = db.collection('users');

    if (!oldState.channelId && newState.channelId) {
        let user = await userCollection.findOne({ userId });

        if (!user) {
            user = {
                userId,
                userName: newState.member.user.tag,
                id: crypto.randomBytes(16).toString('hex'),
                totalMinutes: 0,
                thisMonthMinutes: 0,
            };
            await userCollection.insertOne(user);
            console.log(`Account created for ${newState.member.user.tag}`);
        }

        usersInVoiceChannels.add(userId);
        console.log(`${newState.member?.user.tag} joined channel ${newState.channel?.name}`);
    }

    // Check if the user has left a voice channel
    if (oldState.channelId && !newState.channelId) {
        usersInVoiceChannels.delete(userId);
        console.log(`${oldState.member?.user.tag} left channel ${oldState.channel?.name}`);
    }

    // Check if the user has switched voice channels
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        console.log(
            `${newState.member?.user.tag} switched from ${oldState.channel?.name} to ${newState.channel?.name}`,
        );
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

async function updateUserTimes() {
    const userCollection = db.collection('users');

    for (const userId of usersInVoiceChannels) {
        const user = await userCollection.findOne({ userId });
        if (user) {
            await userCollection.updateOne({ userId }, { $inc: { thisMonthMinutes: 1, totalMinutes: 1 } });
            console.log(
                `Updated time for ${user.userName}: ${user.thisMonthMinutes + 1} minutes this month, ${user.totalMinutes + 1} minutes total.`,
            );
        }
    }

    console.log('1 minute log', userDatabase);
}
