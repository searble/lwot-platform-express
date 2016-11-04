# LWOT Platform - Express

## Install

### Install Dependencies

```bash
sudo apt-get install mysql-server mysql-client redis-*  #ubuntu
brew install mysql redis                                #Mac
```

### Install Platform

```bash
lwot install https://github.com/searble/lwot-platform-express
lwot install platform express #not working yet
```

### Run

```bash
lwot build express
lwot run express
```

## Development Guide

You can make API or middleware in your folder `controller/express/`.

- Config
    - `controller/express/config.json`
    - default
    
        ```json
        {
            "port": 27017,
            "dev": true,
            "static-page": {
                "404": "/controller/static/404.html",
                "500": "/www/static/500.html"
            },
            "session": {
                "secret": "LwoT-seSsIon-sEcreT",
                "resave": false,
                "saveUninitialized": false
            },
            "redis": {
                "host": "127.0.0.1",
                "port": 6379
            },
            "mysql": {
                "host": "127.0.0.1",
                "port": "3306",
                "user": "root",
                "password": "",
                "database": "myApp"
            },
            "sendmail": {
                "host": "smtp.host-server.com",
                "user": "email@email.com",
                "password": "password",
                "from": "Service <email@email.com>",
                "ssl": true
            },
            "encrypt": "lWoT"
        }
        ```
        
    - can add more config for middleware 
- API
    - `controller/express/api/[PATH]/[FILE].js` link to `http://host/api/[PATH]/[FILE]`
    - Example api code 
        
        ```javascript
        var express = require("express");
        var router = express.Router();
        
        router.get("/", function (req, res) {
            res.send("Intergrated Application Skeleton");
        });
        
        module.exports = router;
        ```
        
- Middlewares
    - `controller/express/middleware/[FILE].js`
    - Example middleware code
    
        ```javascript
        'use strict';
        module.exports = (config)=> {
            return (req, res, next)=> {
                req.fn = (message)=> {
                    console.log(config);
                    console.log(message);
                }
                next();
            };
        };
        ```
        
        - `config` returns `controller/express/config.json`
        - you can use defined function in API code.  
