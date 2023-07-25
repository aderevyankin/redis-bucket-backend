import { writeFileSync, existsSync, readFileSync, createReadStream } from 'fs'
import { spawn } from 'child_process'
import { createClient } from 'redis'
import md5 from 'md5'
import { download, upload, exists } from '@yababay67/s3-uploader'

const { REDIS_SERVER_PATH, AWS_DEFAULT_KEY } = process.env

if (!REDIS_SERVER_PATH) throw 'Please setup path of redis server'

const prepareDump = async () => {
    if (await exists()) {
        console.log('Downloading last dump from bucket...')
        const dump = await download()
        console.log('Almost did...')
        writeFileSync(AWS_DEFAULT_KEY, dump)
        console.log('Downloaded!)')
    }
}

let client = null
let saveInterval = null
let md5Previous = null

const startRedisServer = () => new Promise((resolve, reject) => {
    const redisServer = spawn(REDIS_SERVER_PATH);
    let message = '';
    redisServer.stdout.on('data', (data) => {
        message += data.toString();
        console.log(message);
        if (message.includes('Ready to accept connections')) {
            resolve('Redis Server успешно запущен!');
        }
    });

    redisServer.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject();
    });
});

export default async (req, _, next) => {
    if (!client) {
        await prepareDump()
        await startRedisServer()
        client = createClient()

        await client.connect()
        saveInterval = setInterval(async () => {
            if (!existsSync(AWS_DEFAULT_KEY)) return
            await client.save()
            const md5Current = md5(readFileSync(AWS_DEFAULT_KEY))
            console.log(md5Current);
            if (md5Current === md5Previous) return
            const fileStream = createReadStream(AWS_DEFAULT_KEY);
            await upload(fileStream)
            md5Previous = md5Current
            console.log('Backup is sent to bucket! ' + new Date);
        }, 15000)
        console.log('Redis server and client are ready.')
    }
    req.redisClient = client
    next()
}