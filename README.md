## Quick start

```
1. install MongoDB
2. fill the collection subsidiaries
    тип: POST
    адрес: http://localhost:3000/api/subsidiary
    тело запроса:
    {
        "name": "Газпромнефть-Ямал (ООО)"
    }
3. setup environment variables
    GPN_DB_HOST // host
    GPN_DB_PORT // port
    GPN_DB_NAME // database
4. terminal: npm install
5. terminal: ng b
6. go to folder projects\server & terminal: node server.js
```

## Dev

```
* Do "quick start" from 1 to 4 and 6
7. set configuration of proxy: proxy.conf.json
8. terminal: ng serve --proxy-config proxy.conf.json
```

### Install CLI

`sudo npm install -g @angular/cli`

### To make a new component:

`ng g c components/new-component`

##### Recommendations:

```
npm install -g nodemon
terminal: nodemon server.js
```
