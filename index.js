'use strict';

module.exports = (()=> {
    const fs = require('fs');
    const path = require('path');
    const spawn = require("child_process").spawn;
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
    plugin.compiler = 'lwot';

    plugin.run = ()=> new Promise((callback)=> {
        let config = JSON.parse(fs.readFileSync(path.resolve(RUN_PATH, 'controller', 'config.json'), 'utf-8'));
        terminal('node', ['express'], {cwd: RUN_PATH}).then(()=> {
            callback();
        });

        setTimeout(()=> {
            open('http://localhost:' + config.express.port);
        }, 500);
    });

    return plugin;
})();