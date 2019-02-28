# Quickly watch real-time memory stats of your nuxt app
[![npm](https://img.shields.io/npm/dt/nuxt-memwatch.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-memwatch)
[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-memwatch/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-memwatch)

## Why and when do you use this module

Other tools may provide the same or better functionality, but this module is probably the quickest way to get more insights in the memory usage of your nuxt server. Especially when using the node-memwatch peer dependency it could help you track down memory leaks. See [node-memwatcher](https://github.com/pimlie/node-memwatcher) and [node-memwatch](https://github.com/airbnb/node-memwatch) readme's for more information

<p align="center"><img src="./assets/demo.gif" alt="nuxt-memwatch demo"/></p>

## Setup
> :information_source: Please note you dont need to re-build your project when en-/disabling this module, you only need to restart the server

##### Install
```
npm install --save nuxt-memwatch
// or
yarn add nuxt-memwatch
```

##### Install the node-memwatcher peer dependency (recommended)
```
npm install --save @airbnb/node-memwatch
// or
yarn add @airbnb/node-memwatch
```

##### Add `nuxt-memwatch` to `modules` section of `nuxt.config.js`
```js
  modules: [
    ['nuxt-memwatch', { graph: false }],
  ]
```
or 
```js
  modules: [
    'nuxt-memwatch'
  ],
  memwatch: {
    graphSetup(setup) {
      setup.metrics.malloc = {
        aggregator: 'avg',
        color: 'cyan'
      }
    },
    graphAddMetric(turtleGraph, stats) {
      turtleGraph.metric('my metrics', 'malloc').push(stats.malloced_memory)
    }
  }
```

## Example

You can run the included example by cloning this repo, run `yarn install && yarn build` and finally `yarn start`. Then generate some requests by running `ab -c100 -n100000 http://127.0.0.1:3000/`, this example uses max ~1.3GB of memory which is fine-tuned for node's default heap size limit of 1.5GB

## Module Options

Besides the default [node-memwatcher options](https://github.com/pimlie/node-memwatcher#options), this module provides some extra options

#### `gcAfterEvery` _number_ (0)

If set to a number larger then 0, we will force the gc to run after this number of requests. E.g. when set to 1 the gc runs after every request

> :fire: This only works when you have either installed the peerDependency or are running node with `--expose_gc`

#### `nuxtHook` _string_ (listen)

Normally we are interested in memory usage when nuxt is serving requests, so we start listening for stats events on the listen hook. If you are running this module in development mode, we listen for `build:done` instead if you dont change this value. You can probably leave this to the default, but if you want to debug the nuxt generate command you could do:

```js
// nuxt.config.js

import { getMemwatch } from 'node-memwatcher'
let memwatch

export default {
  ...
  memwatch: {
    graph: false,
    nuxtHook: 'generate:before'
  },
  hooks: {
    generate: {
      async before() {
        memwatch = await getMemwatch()
      },
      page() {
        // this probably wont work as you expect
        // as node will probably be too busy generating pages
        // and the gc will only run after
        // generate.concurrency routes have finished
        memwatch.gc()
      }
    }
  }
  ...
```
