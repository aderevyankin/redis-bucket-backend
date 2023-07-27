const app = require('express')()
const { redisStarter } = require('@yababay67/redis-starter')
const { HTTP_PORT } = process.env
const { noteMiddleware } = require('./model')

app.use(redisStarter)
app.use(noteMiddleware) 

app.get('/', (req, res) => res.end('<a href="/hello">hello</a>'))
app.get('/hello', async (req, res) => res.end(await req.redisClient.get('hello')))
app.get('/add', async (req, res) => {
    const { noteRepository } = req
    const note = {
        picture: 'hello.jpg',
        caption: 'hello, caption',
        tumblrId: Math.floor(Math.random() * 900000) + 1000000,
        bucket: 'random-history'
    }
    await noteRepository.save(note)
    res.end('OK')
})

app.get('/find', async (req, res) => {
    const { noteRepository } = req
    const notes = await noteRepository.find()
    res.json(notes)
})

app.listen(HTTP_PORT, () => console.log(`Server is listening on ${HTTP_PORT}`))

