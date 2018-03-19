
import preact from 'preact'

/** @jsx preact.h */

export default class MandelbrotCanvas extends preact.Component {

  constructor(props) {
    super(props)
    this.canvas = null

    // TODO maybe this should call the actual plotter rather than receiving bytes as props?
  }

  componentDidMount() {
    if (this.canvas === null) {
      return
    }

    MandelbrotCanvas.paint(this.canvas, this.props.imgBytes)
  }

  static paint(canvas, imgBytes) {
    // TODO these should be props
    const width = canvas.width
    const height = canvas.height

    const ctx = canvas.getContext('2d')
    const imgData = ctx.createImageData(canvas.width, canvas.height)

    for (let i = 0; i < width * height; i++) {
      const imgOffset = i * 3
      const canvasOffset = i * 4
      imgData.data[canvasOffset] = imgBytes[imgOffset]
      imgData.data[canvasOffset + 1] = imgBytes[imgOffset + 1]
      imgData.data[canvasOffset + 2] = imgBytes[imgOffset + 2]
      imgData.data[canvasOffset + 3] = 0xff
    }



    ctx.putImageData(imgData, 0, 0)
  }

  render() {
    return <div>
      <canvas ref={(canvas) => this.canvas = canvas} width="840" height="840"/>
    </div>
  }
}
