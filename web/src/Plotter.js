
import PlotterWorker from 'worker-loader!./PlotterWorker'
import MSG_TYPES from './workerMsgTypes'

const DEFAULTS = {
  ssScale: 1,
  centreX: -2.0/3.0,
  centreY: 0.0,
  plotWidth: 2.5,
  plotHeight: 2.5
}

export default class Plotter {

  nextMsgId = 0

  msgsAwaitingReponse = new Map()

  constructor(wasmModule) {
    this.worker = new PlotterWorker()

    this.worker.onmessage = (replyMessageEvent) => {
      const { msgId, data, error } = replyMessageEvent.data

      if (!this.msgsAwaitingReponse.has(msgId)) {
        console.log(`Got reply for unknown msgId ${msgId}. Seems like a bug.`)
        return
      }

      const { resolve, reject } = this.msgsAwaitingReponse.get(msgId)
      this.msgsAwaitingReponse.delete(msgId)

      if (error !== undefined) {
        reject(error)
      } else {
        resolve(data)
      }
    }

    this.wasmInstantiated = this.sendMessage(MSG_TYPES.RECEIVE_WASM, wasmModule)
  }

  plot = (options) => {
    const params = Object.assign({}, DEFAULTS, options)

    return this.wasmInstantiated
      .then(() => {
        return this.sendMessage(MSG_TYPES.PLOT, params)
      })
  }

  sendMessage = (type, data) => new Promise((resolve, reject) => {
    const msgId = this.nextMsgId++

    this.msgsAwaitingReponse.set(msgId, { resolve, reject })

    this.worker.postMessage({ msgId, type, data })
  })

}
