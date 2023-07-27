const express = require('express')
const app = express()
const { redisStarter } = require('@yababay67/redis-starter')
const { PORT } = process.env
const { noteMiddleware } = require('./model')

app.use(express.static('public'))
app.use(redisStarter)
app.use(noteMiddleware)

app.get('/hello', async (req, res) => res.end(await req.redisClient.get('hello')))
app.get('/add', async (req, res) => {
    const { value } = req.query;
    const { noteRepository } = req
    const note = {
        picture: 'hello.jpg',
        caption: value || 'hello, caption',
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

app.listen(PORT, () => console.log(`Server is listening on ${PORT}`))
