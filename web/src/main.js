
import preact from 'preact'

import Mandelbrot from './Mandelbrot'
import MandelbrotCanvas from './MandelbrotCanvas'

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
      const mandelbrot = new Mandelbrot(wasmModule.instance)

      // TODO solve sizing
      preact.render(<MandelbrotCanvas imgBytes={mandelbrot.plot({ width: 840, height: 840, ssScale: 2 }) } />, document.getElementById('root'))
    })
}
