
import preact from 'preact'

/** @jsx preact.h */

const STATUSES = {
  PRE_PLOT: 'PRE_PLOT',
  PLOTTING: 'PLOTTING',
  PLOTTED: 'PLOTTED'
}

export default class MandelbrotCanvas extends preact.Component {

  constructor(props) {
    super(props)
    this.canvas = null

    this.state = {
      status: STATUSES.PRE_PLOT,
      lastPlot: null
    }
  }

  plot = (params) => {
    this.setState({
      status: STATUSES.PLOTTING
    })

    const imageSize = params.imageWidth
    const plotSize = params.plotWidth

    const plotResult = this.props.plotter.plot({
      width: imageSize,
      height: imageSize,
      centreX: params.plotCentreX,
      centreY: params.plotCentreY,
      plotWidth: plotSize,
      plotHeight: plotSize
    })

    return plotResult
      .then(plotResult => {
        this.setState({
          status: STATUSES.PLOTTED,
          lastPlot: {
            params,
            imageBytes: new Uint8Array(plotResult.imageBuffer),
            time: plotResult.time
          }
        })

        console.log(`plotted in ${plotResult.time}ms`)
      })
  }

  repaintCanvasIfNeeded = () => {
    const { status, lastPlot } = this.state

    if (status !== STATUSES.PLOTTED) {
      console.log('not repainting - wrong state')
      return
    } else if (this.canvas.lastPaintedParams === lastPlot.params) {
      console.log('not repainting - last painted params match last plot params')
      return
    }

    MandelbrotCanvas.paint(this.canvas, lastPlot)
  }

  componentDidUpdate = this.repaintCanvasIfNeeded

  static paint(canvas, { params, imageBytes }) {
    const width = canvas.width
    const height = canvas.height

    const ctx = canvas.getContext('2d')
    const imageData = ctx.createImageData(canvas.width, canvas.height)

    for (let i = 0; i < width * height; i++) {
      const imageOffset = i * 3
      const canvasOffset = i * 4
      imageData.data[canvasOffset] = imageBytes[imageOffset]
      imageData.data[canvasOffset + 1] = imageBytes[imageOffset + 1]
      imageData.data[canvasOffset + 2] = imageBytes[imageOffset + 2]
      imageData.data[canvasOffset + 3] = 0xff
    }

    ctx.putImageData(imageData, 0, 0)

    canvas.lastPaintedParams = params
  }

  render = (props, { status, lastPlot }) => {
    // TODO consider always rendering the canvas and just show/hide with css?
    // TODO switch?
    if (status === STATUSES.PRE_PLOT) {
      // TODO better placeholder? nothing at all?
      return <p>[Plot goes here]</p>
    } else if (status === STATUSES.PLOTTING) {
      // TODO spinner
      return <p>Plotting...</p>
    } else {
      const imageWidth = lastPlot.params.imageWidth
      return <div>
        <p>Plotted in {lastPlot.time}ms</p>
        <canvas ref={(canvas) => this.canvas = canvas} width={imageWidth} height={imageWidth}/>
      </div>
    }
  }
}
