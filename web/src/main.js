
import preact from 'preact'

import Plotter from './Plotter'
import MandelbrotForm from './MandelbrotForm'

/** @jsx preact.h */

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

function compileWasm() {
  const stream = fetch('mandelbrot_wasm.wasm')

  if (WebAssembly.compileStreaming) {
    return WebAssembly.compileStreaming(stream)
      .catch(e => {
        console.log(e)
        console.log('WebAssembly.compileStreaming failed. Falling back to older method...')
        return compileWasmFallback(stream)
      })
  } else {
    return compileWasmFallback(stream)
  }
}

function compileWasmFallback(stream) {
  return stream
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.compile(bytes))
}

export function start() {
  return compileWasm()
    .then(wasmModule => {
      const plotter = new Plotter(wasmModule)

      const rootElem = document.getElementById('root')

      preact.render(<MandelbrotForm plotter={plotter}/>, rootElem, rootElem.lastElementChild)
    })
}
