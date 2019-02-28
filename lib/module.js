import env from 'std-env'
import consola from 'consola'
import { start, setOptions, getMemwatch } from 'node-memwatcher'

export default function nuxtMemwatch(options = {}) {
  let nuxtHook = 'listen'
  if (options.nuxtHook) {
    nuxtHook = options.nuxtHook
  }

  if (this.options.memwatch && this.options.memwatch.nuxtHook) {
    nuxtHook = this.options.memwatch.nuxtHook
  }

  // listen for build:done in dev mode because the server
  // already listens before building is finished
  if (this.options.dev && nuxtHook === 'listen') {
    nuxtHook = 'build:done'
  }

  this.nuxt.hook(nuxtHook, async () => {
    const logger = consola.withScope('memwatch')

    if (!env.tty) {
      logger.info('No tty found, nuxt-memwatch will not run')
      return
    }

    options = setOptions(this.options.memwatch || options)

    if (options.autoHeapDiff && !this.options.dev) {
      logger.warn(`Creating heapDiffs is very expensive, only enable this in production if you really have to`)
    }

    options.appName = 'nuxt-memwatch'
    options.groupName = 'nuxt-memwatch'
    options.gcAfterEvery = options.gcAfterEvery || 0

    if (options.graph) {
      let requestCounter = 0

      options.graphSetup.push((graphSetup) => {
        graphSetup.metrics.requests = {
          min: 0,
          aggregator: 'avg',
          color: 'magenta,bold'
        }
      })

      options.graphAddMetric.push((turtle, stats) => {
        turtle.metric(options.groupName, 'requests').push(requestCounter)
        requestCounter = 0
      })

      this.nuxt.hook('render:routeDone', () => (requestCounter++))
    }

    if (options.gcAfterEvery) {
      const memwatch = await getMemwatch()
      let gcRequestCounter = 0

      this.nuxt.hook('render:routeDone', () => {
        gcRequestCounter++

        if (gcRequestCounter >= options.gcAfterEvery) {
          memwatch.gc()
          gcRequestCounter = 0
        }
      })
    }

    start(options)
  })
}
