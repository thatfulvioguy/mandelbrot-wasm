
/* eslint-env: worker */

import MSG_TYPES from './MessageTypes'
import onWorkerMessage from './PromiseTransportWorker'

let wasmApi = null

const IMPORTS = {
  env: {
    expf: Math.exp,
    sinf: Math.sin,
    powf: Math.pow,
    sin: Math.sin,
    cos: Math.cos,
    round: Math.round,
    log2f: Math.log2,
    exp2f: (n) => Math.pow(2, n)
  }
}

onWorkerMessage((type, data) => {
  if (type === MSG_TYPES.RECEIVE_WASM) {

    return instantiateWasm(data)

  } else if (type === MSG_TYPES.PLOT) {
    if (wasmApi === null) {
      return Promise.reject(new Error('WASM module not instantiated yet. Definitely a bug.'))
    }

    return new Promise((resolve) => {
      const plot = plotImage(data)
      resolve({ data: plot, transferables: [plot.imageBuffer] })
    })
  }

  return Promise.reject(new Error(`Unrecognised message type: ${type}`))
})

function instantiateWasm(wasmModule) {
  return WebAssembly.instantiate(wasmModule, IMPORTS)
    .then(instance => {
      const exports = instance.exports

      wasmApi = {
        plotMandelbrot: exports.plot_mandelbrot,
        imageBytesPtr: exports.image_bytes_ptr,
        destroyImage: exports.destroy_image,
        memory: exports.memory
      }
    })
}

function plotImage(params) {
  const { width, height, ssScale, chunkHeight, chunkTop, originX, originY, plotWidth, plotHeight } = params

  const startTime = performance.now()

  const imagePtr = wasmApi.plotMandelbrot(width, height, ssScale, chunkHeight, chunkTop, originX, originY, plotWidth, plotHeight)
  const imageBytesPtr = wasmApi.imageBytesPtr(imagePtr)

  const imageBytes = new Uint8Array(wasmApi.memory.buffer, imageBytesPtr, width * chunkHeight * 3)
  const imageBytesCopy = imageBytes.slice(0, imageBytes.length)

  wasmApi.destroyImage(imagePtr)

  return {
    // None of the typed array views are supported by postmessage, only ArrayBuffers
    imageBuffer: imageBytesCopy.buffer,
    time: performance.now() - startTime
  }
}
