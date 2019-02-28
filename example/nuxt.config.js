let log = []
let dev

export default {
  modules: [
    '@/../lib/module'
  ],
  hooks: {
    listen(server, listener) {
      dev = listener.dev
    },
    render: {
      routeDone(url, res, context) {
        log.push(res)

        // development mode significantly increases used memory already
        // and it crashes around ~3k requests anyway
        if (log.length > (dev ? 100 : 18000)) {
          log = []
        }
      }
    }
  },
  memwatch: {
    graph: true,
    gcMetrics: false,
    gcAfterEvery: 0,
    autoHeapDiff: true,
    useMovingAverage: 5,
    graphSetup(graphSetup) {
      graphSetup.metrics.malloc = {
        aggregator: 'avg',
        color: 'cyan'
      }
    },
    graphAddMetric(graph, stats) {
      graph.metric('my metrics', 'malloc').push(stats.malloced_memory)
    }
  }
}
