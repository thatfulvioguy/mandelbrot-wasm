
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

function loadWasm() {
  // TODO switch to streaming
  return fetch('mandelbrot_wasm.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, IMPORTS))
}

export function start() {
  return loadWasm()
    .then(wasmModule => {
      const plotter = new Plotter(wasmModule.instance)
      const rootElem = document.getElementById('root')

      preact.render(<MandelbrotForm plotter={plotter}/>, rootElem, rootElem.lastElementChild)
    })
}
