
console.log('foo.js loaded')

const IMPORTS = {
  env: {
    expf: Math.exp,
    sinf: Math.sin,
    powf: Math.pow,
    sin: Math.sin,
    cos: Math.cos,
    round: Math.round,
    log2f: Math.log2,
    exp2f: (x) => Math.pow(2, x)
  }
}

const DEFAULTS = {
  ssScale: 1,
  centreX: -2.0/3.0,
  centreY: 0.0,
  plotWidth: 2.5,
  plotHeight: 2.5
}

fetch('mandelbrot_wasm.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, IMPORTS))
  .then(wasm => {
    wasmWait.style.display = 'none'

    const wasmPlotMandelbrot = wasm.instance.exports.plot_mandelbrot
    window.plotMandelbrot = function plotMandelbrot({ width, height, ssScale, centreX, centreY, plotWidth, plotHeight }) {
      const imagePtr = wasmPlotMandelbrot(width, height, ssScale, centreX, centreY, plotWidth, plotHeight)

      return imagePtr
    }

    window.imgBytesPtr = wasm.instance.exports.image_bytes_ptr
    window.destroyImage = wasm.instance.exports.destroy_image


    window.plotMandelbrotToCanvas = function plotMandelbrotToCanvas(options = {}) {
      const {
        ssScale,
        centreX,
        centreY,
        plotWidth,
        plotHeight
      } = Object.assign({}, DEFAULTS, options)

      plottingWait.style.display = 'block'

      setTimeout(() => {
        const canvas = mandelbrotCanvas
        const width = canvas.width
        const height = canvas.height

        const img = plotMandelbrot({
          width,
          height,
          ssScale,
          centreX,
          centreY,
          plotWidth,
          plotHeight
        })

        plottingWait.style.display = 'none'

        const bytesPtr = imgBytesPtr(img)

        const ctx = canvas.getContext('2d')
        const imgData = ctx.createImageData(canvas.width, canvas.height)

        const imgBytes = new Uint8Array(wasm.instance.exports.memory.buffer, bytesPtr, width * height * 3)

        for (var i = 0; i < width * height; i++) {
          const imgOffset = i * 3
          const canvasOffset = i * 4
          imgData.data[canvasOffset] = imgBytes[imgOffset]
          imgData.data[canvasOffset + 1] = imgBytes[imgOffset + 1]
          imgData.data[canvasOffset + 2] = imgBytes[imgOffset + 2]
          imgData.data[canvasOffset + 3] = 0xff
        }

        ctx.putImageData(imgData, 0, 0)

        destroyImage(img)
      }, 10)
    }

    setTimeout(plotMandelbrotToCanvas, 10);
  })