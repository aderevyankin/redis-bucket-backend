const { Repository } = require('redis-om')

module.exports = class FindableRepository extends Repository {
    constructor(schema, redisClient){
        super(schema, redisClient)
        this.redisClient = redisClient
        this.prefix = schema.schemaName
    }

    async find(choose){
        const keys = await this.redisClient.keys(`${this.prefix}:*`)
        const all = await this.fetch(keys.map(el => /.*\:(.*)$/.exec(el)[1]))
        return choose ? all.filter(choose) : all
    }
}

