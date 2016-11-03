'use strict';

var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var fs = require("./modules/fs");

/* Express */
var express = require("express");
var app = express();

/* Cookie / Request Body Parser */
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

/* Session */
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var Redis = require("ioredis");

const rootPath = path.resolve(__dirname);

try {
    fs.statSync(path.resolve(rootPath, 'controller', 'config.json'));
}
catch (err) {
    if (err.code == "ENOENT")
        console.log("Setting the 'config-sample.json', Change the file name to 'config.json'");
    else
        console.log(err);

    process.exit(-1);
}

const configJSON = JSON.parse(fs.readFileSync(path.resolve(rootPath, 'controller', 'config.json')) + "");
const serviceConfig = configJSON.express;

/* Listening Port Setting */
app.set("port", serviceConfig.port);

/* Logger Setting */
app.use(logger("dev"));

/* Cookie / Request Body Parser Setting */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

/* Static Path Setting */
app.use(express.static(path.join(__dirname, 'www')));

/* Favicon Setting */
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

/* Session Setting */
var redisClient = new Redis(serviceConfig.redis);
app.use(session({
    secret: serviceConfig.session.secret,
    store: new RedisStore({client: redisClient}),
    resave: serviceConfig.session.resave,
    saveUninitialized: serviceConfig.session.saveUninitialized
}));

/* Middlewares Setting */
let MIDDLEWARE_DIR = path.resolve(rootPath, 'controller', 'middlewares');
let MIDDLEWARE_LIST = fs.getFiles(MIDDLEWARE_DIR);

for (let i = 0; i < MIDDLEWARE_LIST.length; i++)
    app.use(require(path.resolve(MIDDLEWARE_DIR, MIDDLEWARE_LIST[i]))(serviceConfig));


/* API Routes Setting */
let API_ROOT = path.resolve(__dirname, 'controller', 'api');
var api_routes = fs.getFiles(API_ROOT);
for (var i = 0; i < api_routes.length; i++) {
    var rmodule = require(path.resolve(API_ROOT, api_routes[i]));
    var href = '/api' + path.resolve(API_ROOT, path.basename(api_routes[i], path.extname(api_routes[i]))).replace(API_ROOT, '');
    app.use(href, rmodule);
    console.log("[routes]", href);
}

/* Exception Handling */
// not found error
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;

    res.status(err.status || 500);
    res.send("404 Not Found");
});

// error page
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send("404 Not Found");
});

module.exports = app;
