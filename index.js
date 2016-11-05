'use strict';

module.exports = (()=> {
    let spawn = require("child_process").spawn;
    // if windows
    if (process.platform == 'win32')
        spawn = require('cross-spawn');

    const fs = require('fs');
    const path = require('path');
    const open = require("open");

    const PLUGIN_ROOT = path.resolve(__dirname);
    const RUN_PATH = path.resolve(PLUGIN_ROOT, 'app');

    let terminal = (cmd, args, opts)=> new Promise((callback)=> {
        const term = spawn(cmd, args, opts);
        term.stdout.pipe(process.stdout);
        term.stderr.pipe(process.stderr);
        process.stdin.pipe(term.stdin);
        term.on('close', () => {
            process.stdin.end();
            callback();
        });
    });

    let plugin = {};

    plugin.run = ()=> new Promise((callback)=> {
        let config = JSON.parse(fs.readFileSync(path.resolve(RUN_PATH, 'controller', 'config.json'), 'utf-8'));
        terminal('nodemon', ['express.js'], {cwd: RUN_PATH}).then(()=> {
            callback();
        });

        setTimeout(()=> {
            open('http://localhost:' + (config.port ? config.port : 27017));
        }, 500);
    });

    return plugin;
})();