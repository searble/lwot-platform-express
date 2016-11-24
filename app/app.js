'use strict';

module.exports = (modules)=> {
    // node_modules
    const path = require("path");
    const favicon = require("serve-favicon");
    const logger = require("morgan");
    const fs = require("./modules/fs");
    const cookieParser = require("cookie-parser");
    const bodyParser = require("body-parser");
    const express = require("express");

    // const
    const ROOT_PATH = path.resolve(__dirname);
    const CONFIG_PATH = path.resolve(ROOT_PATH, 'controller', 'config.json');
    const MIDDLEWARE_PATH = path.resolve(ROOT_PATH, 'controller', 'middleware');
    const API_PATH = path.resolve(__dirname, 'controller', 'api');

    if (!fs.existsSync(CONFIG_PATH)) {
        console.log(`create 'config.json' file.`);
        return;
    }

    // config
    const configJSON = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    let app = express();
    app.set("port", configJSON.port ? configJSON.port : 27017);

    for (let key in modules) modules[key] = modules[key](app, configJSON);

    // set default middlewares
    if (configJSON.dev)
        app.use(logger("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'www')));
    app.use((req, res, next)=> {
        req.modules = modules;
        next();
    });

    // Middlewares extension setting
    let MIDDLEWARE_LIST = fs.getFiles(MIDDLEWARE_PATH);
    for (let i = 0; i < MIDDLEWARE_LIST.length; i++)
        app.use(require(path.resolve(MIDDLEWARE_PATH, MIDDLEWARE_LIST[i]))(configJSON));

    // API route
    let api_routes = fs.getFiles(API_PATH);
    for (let i = 0; i < api_routes.length; i++) {
        let rmodule = require(api_routes[i]);
        let href = '/api' + api_routes[i].substring(0, api_routes[i].length - path.extname(api_routes[i]).length).replace(API_PATH, "");
        app.use(href, rmodule);
        console.log("[routes]", href);
    }

    // not found error
    app.use(function (req, res, next) {
        let err = new Error("Not Found");
        err.status = 404;
        next(err);
    });

    // error page
    app.use(function (err, req, res) {
        res.status(err.status || 500);

        if (configJSON['static-page']) {
            if (configJSON['static-page'][err.status]) {
                let file_path = path.resolve(ROOT_PATH, configJSON['static-page'][err.status]);
                if (fs.existsSync(file_path)) {
                    res.send(fs.readFileSync(file_path, 'utf-8'));
                    return;
                }
            }
        }

        res.send(`<h1>STATUS ${err.status}</h1><hr/><p>${JSON.stringify(err, null, 4)}</p>`);
    });

    return app;
};