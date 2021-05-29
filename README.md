# GUI for gpn-audit project

## Quick start

1\. Install MongoDB

2\. Setup environment variables

- GPN_DB_HOST // host
- GPN_DB_PORT // port
- GPN_DB_NAME // database

3\. Instll node.js v10

https://nodejs.org/dist/latest-v10.x/

3.1\. Install dependencies:

```bash
$ npm install
```

4\. Build project:

```bash
$ ng b
```

5\. Run the server:

```
node ./projects/server/server.js
```

- For starting without AD authentication put false as the first parameter:

```bash
node ./projects/server/server.js false
```

- without AD authentication you can define username (by default it is admin) for the client session as the second parameter:

```bash
node ./projects/server/server.js false user1
```

## Dev

Do "quick start" from 1 to 4 and 6

8\. set configuration of proxy: proxy.conf.json

9\. terminal: ng serve --proxy-config proxy.conf.json

### Install CLI

```bash
$ sudo npm install -g @angular/cli
```

### To make a new component:

```bash
$ ng g c components/new-component
```

##### Recommendations:

```bash
$ npm install -g nodemon
$ nodemon server.js
```
