
import PlotterWorker from 'worker-loader!./worker/PlotterWorker'
import MSG_TYPES from './worker/MessageTypes'
import PromiseTransportParent from './worker/PromiseTransportParent'

const DEFAULTS = {
  ssScale: 1,
  centreX: -2.0/3.0,
  centreY: 0.0,
  plotWidth: 2.5,
  plotHeight: 2.5
}

export default class Plotter {

  worker = new PromiseTransportParent(new PlotterWorker())

  constructor(wasmModule) {
    this.wasmInstantiated = this.worker.sendMessage(MSG_TYPES.RECEIVE_WASM, wasmModule)
  }

  plot = (options) => {
    const params = Object.assign({}, DEFAULTS, options)

    return this.wasmInstantiated
      .then(() => {
        return this.worker.sendMessage(MSG_TYPES.PLOT, params)
      })
  }

}
