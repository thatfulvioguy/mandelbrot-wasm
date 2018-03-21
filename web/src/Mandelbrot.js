
const DEFAULTS = {
  ssScale: 1,
  centreX: -2.0/3.0,
  centreY: 0.0,
  plotWidth: 2.5,
  plotHeight: 2.5
}

export default class Mandelbrot {

  constructor(wasmInstance) {
    const exports = wasmInstance.exports
    this.wasmIface = {
      plotMandelbrot: exports.plot_mandelbrot,
      imageBytesPtr: exports.image_bytes_ptr,
      destroyImage: exports.destroy_image,
      memory: exports.memory
    }
  }

  plot(options) {
    const {
      width,
      height,
      ssScale,
      centreX,
      centreY,
      plotWidth,
      plotHeight
    } = Object.assign({}, DEFAULTS, options)

    const imgPtr = this.wasmIface.plotMandelbrot(width, height, ssScale, centreX, centreY, plotWidth, plotHeight)
    const imgBytesPtr = this.wasmIface.imageBytesPtr(imgPtr)

    const imgBytes = new Uint8Array(this.wasmIface.memory.buffer, imgBytesPtr, width * height * 3)
    const imgBytesCopy = imgBytes.slice(0, imgBytes.length)

    this.wasmIface.destroyImage(imgPtr)

    return imgBytesCopy
  }

}