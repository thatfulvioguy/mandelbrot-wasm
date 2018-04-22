
/* eslint-env: worker */

import MSG_TYPES from './workerMsgTypes'

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

self.onmessage = (messageEvent) => {
  const { msgId, type, data } = messageEvent.data

  if (type === MSG_TYPES.RECEIVE_WASM) {
    instantiateWasm(data)
      .then(reply(msgId))
      .catch(replyError(msgId))
  } else {
    if (wasmApi == null) {
      replyError(msgId)(new Error('WASM module not instantiated yet. Definitely a bug.'))
    }

    try {
      const plot = plotImage(data)
      reply(msgId)(plot, [plot.imageBuffer])
    } catch (e) {
      replyError(msgId)(e)
    }
  }
}

const reply = (msgId) => (data, transferrables) => {
  self.postMessage({ msgId, data }, transferrables)
}

const replyError = (msgId) => (error) => {
  self.postMessage({ msgId, error })
}

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
  const { width, height, ssScale, centreX, centreY, plotWidth, plotHeight } = params

  const startTime = Date.now()

  const imagePtr = wasmApi.plotMandelbrot(width, height, ssScale, centreX, centreY, plotWidth, plotHeight)
  const imageBytesPtr = wasmApi.imageBytesPtr(imagePtr)

  const imageBytes = new Uint8Array(wasmApi.memory.buffer, imageBytesPtr, width * height * 3)
  const imageBytesCopy = imageBytes.slice(0, imageBytes.length)

  wasmApi.destroyImage(imagePtr)

  return {
    // None of the typed array views are supported by postmessage, only ArrayBuffers
    imageBuffer: imageBytesCopy.buffer,
    time: Date.now() - startTime
  }
}
