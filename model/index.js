const { Schema } = require('redis-om')
const FindableRepository = require('./findable.js')

const noteSchema = new Schema('note', {
    picture: { type: 'string' },
    bucket: { type: 'string' },
    caption: { type: 'string' },
    tumblrId: { type: 'number' },
}, {
  dataStructure: 'HASH'
})

let noteRepository = null

module.exports.noteMiddleware = async (req, res, next) => {
    if(!noteRepository) {
        const { redisClient } = req
        noteRepository = new FindableRepository(noteSchema, redisClient)
        console.log('Post repository is created.')
    }
    req.noteRepository = noteRepository
    next()
}

