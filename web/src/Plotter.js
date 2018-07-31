
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
    params.originX = params.centreX - (params.plotWidth / 2)
    params.originY = params.centreY - (params.plotHeight / 2)

    const startTime = performance.now()

    const chunks = partitionPlot(params)
      .map((chunk) => this.wasmInstantiated
        .then(() => this.worker.sendMessage(MSG_TYPES.PLOT, chunk))
      )

    return Promise.all(chunks).then((chunksResults) => ({
      imageBuffer: concatChunkBuffers(chunksResults),
      time: performance.now() - startTime
    }))
      // TODO this is a crutch
      .catch((e) => {
        console.log(e)
        throw e
      })
  }

}

function partitionPlot(params) {
  const wholeChunks = Math.min(4 * (navigator.hardwareConcurrency), params.height)
  const chunksPixelHeight = Math.floor(params.height / wholeChunks)

  // console.log(`so these are your params ${JSON.stringify(params, null, 2)}`)
  // console.log(`whole chunks ${wholeChunks}, pixel height = ${chunksPixelHeight}`)

  const chunksParams = []
  let remainingHeight = params.height
  for (let i = 0; remainingHeight > 0; i++) {
    const chunkTop = (chunksPixelHeight * i)
    const chunkHeight = Math.min(remainingHeight, chunksPixelHeight)

    chunksParams.push({
      ...params,
      chunkTop,
      chunkHeight
    })

    remainingHeight -= chunkHeight
  }

  //console.log(`here are your chunks ${JSON.stringify(chunksParams, null, 2)}`)

  return chunksParams
}

function concatChunkBuffers(chunks) {
  const totalSize = chunks.reduce((acc, c) => acc + c.imageBuffer.byteLength, 0)
  const result = new Uint8Array(totalSize)
  let offset = 0
  for (let c of chunks) {
    result.set(new Uint8Array(c.imageBuffer), offset)
    offset += c.imageBuffer.byteLength
  }
  return result.buffer
}
