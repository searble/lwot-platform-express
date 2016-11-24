'use strict';

// node_modules
const fs = require('./modules/fs');
const http = require('http');
const path = require('path');

// path
const ROOT_PATH = path.resolve(__dirname);
const CONFIG_PATH = path.resolve(ROOT_PATH, 'controller', 'config.json');
const MODULE_PATH = path.resolve(ROOT_PATH, 'controller', 'module');

// config
const configJSON = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Event Listener
let onError = (error)=> {
    console.log("express.js : onError() : Error!");
    process.exit(1);
};

let onListening = ()=> {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
};

let moduleList = {};
try {
    let modules = fs.getFiles(MODULE_PATH);
    for (let i = 0; i < modules.length; i++)
        try {
            let fn = require(path.resolve(MODULE_PATH, modules[i]));
            if (fn)
                moduleList[path.basename(modules[i], '.js')] = fn;
        } catch (e) {
        }
} catch (e) {
}

const app = require('./app')(moduleList);

// server
var server = http.createServer(app);
server.listen(configJSON.port ? configJSON.port : 27017);
server.on('error', onError);
server.on('listening', onListening);