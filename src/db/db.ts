import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { DiscordUserEntity } from './interface';

dotenv.config();

const clientMongo = new MongoClient(process.env.MONGODB_URI!);
let db: Db;

export async function connectToDatabase() {
    await clientMongo.connect();
    db = clientMongo.db(process.env.MONGO_DB_NAME);
    console.log('Connected to MongoDB');
}

export function getDb(): Db {
    return db;
}
function getDiscordUserCollection(): Collection<DiscordUserEntity> {
    return db.collection<DiscordUserEntity>('users');
}

//------------------------------------------------------
//------------------------------------------------------

export async function findUser(userId: string): Promise<DiscordUserEntity | null> {
    return getDiscordUserCollection().findOne({ userId });
}

export async function insertUser(user: DiscordUserEntity): Promise<void> {
    await getDiscordUserCollection().insertOne(user);
}

export async function updateUserTime(userId: string): Promise<void> {
    await getDiscordUserCollection().updateOne({ userId }, { $inc: { thisMonthMinutes: 1, totalMinutes: 1 } });
}

export async function resetMonthlyDataForAll(): Promise<void> {
    await getDiscordUserCollection().updateMany({}, { $set: { thisMonthMinutes: 0 } });
}
export async function getAllUsers(): Promise<Omit<DiscordUserEntity, 'userId' | 'id'>[]> {
    return await getDiscordUserCollection()
        .find(
            {},
            {
                projection: {
                    userName: 1,
                    thisMonthMinutes: 1,
                    totalMinutes: 1,
                },
            },
        )
        .toArray();
}
