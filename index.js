'use strict';

module.exports = (()=> {
    const fs = require('fs');
    const path = require('path');
    const open = require("open");
    const nodemon = require("nodemon");
    const forever = require("forever");

    const PLUGIN_ROOT = path.resolve(__dirname);
    const RUN_PATH = path.resolve(PLUGIN_ROOT, 'app');

    let plugin = {};

    plugin.run = (args)=> new Promise((callback)=> {
        let config = JSON.parse(fs.readFileSync(path.resolve(RUN_PATH, 'controller', 'config.json'), 'utf-8'));

        nodemon({
            script: path.resolve(RUN_PATH, 'express.js'),
            stdout: true
        });

        setTimeout(()=> {
            open('http://localhost:' + (config.port ? config.port : 27017));
        }, 1000);
    });

    plugin.forever = (args)=> new Promise((callback)=> {
        let config = JSON.parse(fs.readFileSync(path.resolve(RUN_PATH, 'controller', 'config.json'), 'utf-8'));

        let log = ()=> new Promise((next)=> {
            const Tail = require("tail").Tail;

            forever.list(false, (err, list)=> {
                if (!list) list = [];
                let STOP_IDX = -1;
                for (let i = 0; i < list.length; i++)
                    if (list[i].file == path.resolve(RUN_PATH, 'express.js'))
                        STOP_IDX = i;

                if (STOP_IDX === -1) return next();

                let proc = list[STOP_IDX];

                let tail = new Tail(proc.logFile);

                tail.on('line', (data)=> {
                    console.log(data);
                });
            });
        });

        let stop = ()=> new Promise((next)=> {
            forever.list(false, (err, list)=> {
                if (!list) list = [];
                let STOP_IDX = -1;
                for (let i = 0; i < list.length; i++)
                    if (list[i].file == path.resolve(RUN_PATH, 'express.js'))
                        STOP_IDX = i;
                if (STOP_IDX !== -1)
                    forever.stop(STOP_IDX);
                setTimeout(next, 1000);
            });
        });

        let start = ()=> new Promise((next)=> {
            forever.startDaemon(path.resolve(RUN_PATH, 'express.js'), {});
            setTimeout(()=> {
                open('http://localhost:' + (config.port ? config.port : 27017));
                next();
            }, 1000);
        });

        if (!args[0]) {
            stop()
                .then(()=> start())
                .then(()=> log())
                .then(callback);
        } else if (args[0] === 'stop') {
            stop()
                .then(callback);
        } else if (args[0] === 'start') {
            stop()
                .then(()=> start())
                .then(()=> log())
                .then(callback);
        } else if (args[0] === 'log') {
            log()
                .then(callback);
        } else {
            console.log('lwot express forever [log/stop/start]');
        }
    });

    return plugin;
})();