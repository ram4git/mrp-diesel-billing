## Introduction

This is a **cross platform desktop billing application** for fuel stations (in big enterprises) to
- track fuel filling records
- find mileages
- print receipts 
- evaluate driver performances

This application is built using Electron with SQLite3 as the offline DB solutions. This application doesn't require any network connections.

## Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a server sends hot updates to the renderer process:

```bash
$ npm run dev
```

You Run these two commands __simultaneously__ in different console tabs:

```bash
$ npm run hot-updates-server
$ npm run start-hot-renderer
```


## Sass support

If you want to use Sass in your app, you only need to import `.sass` files instead of `.css` once:
```js
import './app.global.scss';
```


## Packaging

To package apps for the local platform:

```bash
$ npm run package
```

To package app for Windows platform
```
npm run package-win
```

To package apps for all platforms:

First, refer to [Multi Platform Build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build) for dependencies.

Then,
```bash
$ npm run package-all
```

To package apps with options:

```bash
$ npm run package -- --[option]
```

## Further commands

To run the application without packaging run

```bash
$ npm run build
$ npm start
```

To run End-to-End Test

```bash
$ npm run build
$ npm run test-e2e
```

## Special Thanks
This project is based on electron-react-boilerplate developed by
- [C. T. Lin](https://github.com/chentsulin)
- [Jhen-Jie Hong](https://github.com/jhen0409)
- [Amila Welihinda](https://github.com/amilajack)

## License
MIT

## Screenshots of UI

**LOGIN PAGE**
<img width="1212" alt="screen shot 2017-09-28 at 1 44 47 am" src="https://user-images.githubusercontent.com/5549877/30953090-16445e56-a3f0-11e7-916c-4b7cba7b0a17.png">

**BILLING PAGE**
<img width="1213" alt="screen shot 2017-09-28 at 1 46 29 am" src="https://user-images.githubusercontent.com/5549877/30953089-164420da-a3f0-11e7-8d82-91ac681ae1e1.png">

**SETTINGS PAGE**
<img width="1211" alt="screen shot 2017-09-28 at 1 46 56 am" src="https://user-images.githubusercontent.com/5549877/30953092-16484d0e-a3f0-11e7-85e2-f2e869851d57.png">
<img width="1214" alt="screen shot 2017-09-28 at 1 47 06 am" src="https://user-images.githubusercontent.com/5549877/30953091-1644e696-a3f0-11e7-8f8c-6d177c41b671.png">

**REPORTS PAGE**
<img width="1213" alt="screen shot 2017-09-28 at 1 47 18 am" src="https://user-images.githubusercontent.com/5549877/30953088-1640820e-a3f0-11e7-969c-b9f65d470f17.png">
<img width="1213" alt="screen shot 2017-09-28 at 1 47 44 am" src="https://user-images.githubusercontent.com/5549877/30953087-16331e84-a3f0-11e7-9b6a-d6184ae94a5d.png">
<img width="1213" alt="screen shot 2017-09-28 at 1 59 53 am" src="https://user-images.githubusercontent.com/5549877/30953283-c739fdce-a3f0-11e7-96fc-cb641b607bee.png">

**RECIEPT**
<img width="840" alt="screen shot 2017-09-28 at 1 52 32 am" src="https://user-images.githubusercontent.com/5549877/30953119-282a41ee-a3f0-11e7-87ba-306215cd6802.png">




## Want to hire?
tweet: @irraju



