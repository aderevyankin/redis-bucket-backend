import { spawn } from 'child_process'; // помогает запускать внешние утилиты
import dotenv from 'dotenv';
import express from 'express';
import { writeFileSync } from 'fs';

import redis, { albumSchema } from './model/index.js';

import { download } from './s3-client.js';


dotenv.config();

const app = express()
const port = process.env.HTTP_PORT || 3000
const DUMP = 'dump.rdb';

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/add', async (req, res) => {
    res.send('item is edit')
})

const startRedisServier = () => new Promise((resolve, reject) => {
    const redisServer = spawn('/usr/local/bin/redis-server');
    let message = '';
    redisServer.stdout.on('data', (data) => {
        message += data.toString();
        if (message.includes('Ready to accept connections')) {
            resolve('Redis Server успешно запущен!');
        }
    });

    redisServer.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject();
    });
});

app.listen(port, async () => {
    try {
        console.log(`Example app listening on port ${port}`)
        let result = await download('redis-dumps', 'dump.rdb');
        writeFileSync(DUMP, result);

        const message = await startRedisServier();
        console.log(message);

        await redis.connect();
        console.log('Соединение установлено!');
        
        const albumRepository = client.fetchRepository(albumSchema);

        await albumRepository.createIndex();

    } catch (error) {
        console.log(error);
    }
})
