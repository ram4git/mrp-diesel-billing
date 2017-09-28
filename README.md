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








