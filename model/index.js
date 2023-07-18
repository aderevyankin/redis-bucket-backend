import { createClient } from 'redis';
import { Schema, Entity } from 'redis-om';

class Album extends Entity { };

export const albumSchema = new Schema(Album, {
    artist: { type: 'string' },
    title: { type: 'text' },
    year: { type: 'number' }
})

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));

export default redis;