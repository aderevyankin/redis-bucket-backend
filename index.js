const fs = require('fs';)
const redis = require('redis')
const md5 = require('md5')
const { download, upload, exists } = require('@yababay67/s3-uploader')

const { REDIS_SERVER_PATH, AWS_DEFAULT_KEY } = process.env

if(!REDIS_SERVER_PATH) throw 'Please setup path of redis server'

const prepareDump = async () => {
    if(await exists()){
        const dump = await download()
        fs.writeFileSync(dump)
    }
}

let client = null
let saveInterval = null
let md5Previous = null

const startRedisServier = () => new Promise((resolve, reject) => {
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

module.exports = req => {
    if(!client){
        await prepareDump()
        await startRedisServer()
        await client.connect()
        saveInterval = setInterval(async () => {
            if(!fs.existsSync(AWS_DEFAULT_KEY)) return
            const md5Current = md5(fs.readFileSync(AWS_DEFAULT_KEY))
            if (md5Current === md5Previous) return
            await upload()
            md5Previous = md5Current
        }, 30000)
        console.log('Redis server and client are ready.')
    }
    req.redisClient = client
}

