const fs = require('fs')
const { spawn } = require('child_process')
const redis = require('redis')
const md5 = require('md5')
const { download, upload, exists } = require('@yababay67/s3-uploader')

const { REDIS_SERVER_PATH, AWS_DEFAULT_KEY } = process.env

if(!REDIS_SERVER_PATH) throw 'Please setup path of redis server'

const prepareDump = async () => {
    if(await exists()){
        console.log('Downloading last dump from bucket...')
        const dump = await download()
        fs.writeFileSync(AWS_DEFAULT_KEY, dump)
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
        if (message.includes('Ready to accept connections')) {
            client = redis.createClient()
            resolve('Redis Server успешно запущен!');
        }
    });

    redisServer.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject();
    });
});

module.exports = async (req, _, next) => {
    if(!client){
        await prepareDump()
        await startRedisServer()
        await client.connect()
        saveInterval = setInterval(async () => {
            if(!fs.existsSync(AWS_DEFAULT_KEY)) return
            await client.save()
            const md5Current = md5(fs.readFileSync(AWS_DEFAULT_KEY))
            if (md5Current === md5Previous) return
            const stream = fs.createReadStream(AWS_DEFAULT_KEY)
            await upload(stream)
            md5Previous = md5Current
            console.log(`Backup is uploaded at ${new Date}`)
        }, 15000)
        console.log('Redis server and client are ready.')
    }
    req.redisClient = client
    next()
}
