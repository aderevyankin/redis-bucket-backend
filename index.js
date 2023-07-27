const fs = require('fs')
const { spawn } = require('child_process')
const redis = require('redis')
const md5 = require('md5')
const { download, upload, exists } = require('@yababay67/s3-uploader')
const { Schema } = require('redis-om')
const FindableRepository = require('./findable.js') 

/**
 * Получаем ключи, требующиеся для работы с AWS и redis 
 */
const { REDIS_SERVER_PATH, AWS_DEFAULT_KEY, BACKUP_INTERVAL } = process.env

if (!REDIS_SERVER_PATH) throw 'Please setup path of redis server'
/**
 * Получение дампа из облачного хранилища
 */
const prepareDump = async () => {
    if (await exists()) {
        console.log('Downloading last dump from bucket...')
        const dump = await download()
        console.log('Downloaded')
        fs.writeFileSync(AWS_DEFAULT_KEY, dump)
        console.log('Dump saved locally')
    }
}

let client = null
let saveInterval = null
let md5Previous = null
/**
 * Запуск Redis server 
 */
const startRedisServer = () => new Promise((resolve, reject) => {
    const redisServer = spawn(REDIS_SERVER_PATH);
    let message = '';
    redisServer.stdout.on('data', (data) => {
        message += data.toString();
        if (message.includes('Ready to accept connections')) {
            client = redis.createClient()
            console.log('Redis Server successfully ran!');//,
            resolve();
        }
    });

    redisServer.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject();
    });
});
/**
 * Экспортируемый модуль, выполняющий функцию оболочки над express-клиентом с интервалом бекапа на удалённое хранилище с помощью yababay67/s3-uploader
 * @param {*} req - запрос
 * @param {*} _ - ответ (response). здесь не используется, оттого заменен на прочерк
 * @param {*} next - переход к следующему запросу, если таковой присутствует
 */

const redisStarter = async (req, _, next) => {
    if (!client) {
        await prepareDump()
        await startRedisServer()
        await client.connect()

        saveInterval = setInterval(async () => {
            if (!fs.existsSync(AWS_DEFAULT_KEY)) return
            await client.save()
            console.log('Dump saved locally');
            const md5Current = md5(fs.readFileSync(AWS_DEFAULT_KEY))
            if (md5Current === md5Previous) return
            const stream = fs.createReadStream(AWS_DEFAULT_KEY)
            await upload(stream)
            console.log('Dump pushed to remote storage');
            md5Previous = md5Current
            console.log(`Backup is uploaded at ${new Date}`)
        }, +BACKUP_INTERVAL)

        console.log('Redis server and client are ready.')
    }
    req.redisClient = client
    next()
}

module.exports = { Schema, FindableRepository, redisStarter }
