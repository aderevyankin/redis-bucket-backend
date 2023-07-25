import express from 'express'
import dotenv from 'dotenv'
import redisStarter from '@yababay67/redis-starter'

dotenv.config()

const app = express()
app.use(redisStarter)

app.get('/', async (req, res) => {
    const r = Math.random()
    await req.redisClient.set('random', `${r}`)
    res.end(```
        <html>
        <head></head>
        <body>
        <p>Please, check new random value with console command:</p>
        <pre>
            <code>redis-cli get random</code>
        </pre>
        <p>It should be ${r}.</p>
        <p>You can reload the page (F5) for one more checking.</p>
        </body>
        </html>
    ```)

})

const httpPort = process.env.HTTP_PORT || 3000

app.listen(httpPort, () => console.log(`Server is listening on port ${httpPort}`))
