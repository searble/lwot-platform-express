'use strict';

module.exports = (config)=> {
    const session = require("express-session");
    const connectRedis = require("connect-redis");
    const Redis = require("ioredis");

    let RedisStore = connectRedis(session);
    let redisClient = new Redis(config.redis);

    return session({
        secret: config.session.secret,
        store: new RedisStore({client: redisClient}),
        resave: config.session.resave,
        saveUninitialized: config.session.saveUninitialized
    });
};