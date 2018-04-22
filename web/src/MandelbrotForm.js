
import preact from 'preact'

import NumberInput from './NumberInput'
import MandelbrotCanvas from './MandelbrotCanvas'

/** @jsx preact.h */

const FORM_DEFAULTS = {
  imageWidth: 720,
  plotWidth: 2.5,
  plotCentreX: -0.66,
  plotCentreY: 0,
}

export default class MandelbrotForm extends preact.Component {

  constructor(props) {
    super(props)
    this.state = {
      ...FORM_DEFAULTS,

      awaitingPlot: false
    }
    this.inputs = {}
    this.canvas = null
  }

  changeHandler = (key) => (value) => {
    console.log(`setting ${key} to ${value} (${typeof value})`)
    this.setState({ [key]: value })
  }

  isValid = () => Object.values(this.inputs).every(input => input.isValid())

  plotIfValid = () => {
    if (!this.isValid()) {
      console.log(`tried to plot, but not valid: ${JSON.stringify(this.state)}`)
      return
    }

    const plotOptions = {
      imageWidth: this.state.imageWidth,
      plotWidth: this.state.plotWidth,
      plotCentreX: this.state.plotCentreX,
      plotCentreY: this.state.plotCentreY,
    }

    console.log(`plot: ${JSON.stringify(plotOptions)}`)

    this.setState({ awaitingPlot: true })

    this.canvas.plot(plotOptions)
      .then(() => {
        this.setState({ awaitingPlot: false })
      })
      .catch(() => {
        // TODO show error
        this.setState({ awaitingPlot: false })
      })
  }

  render({ plotter }, { imageWidth, plotWidth, plotCentreX, plotCentreY, awaitingPlot }) {
    // TODO ss scale
    // TODO proper layout - no p, no explicit space
    return <div>
      <p>
        <NumberInput label="Image width" value={imageWidth} min={32}
          onChange={this.changeHandler('imageWidth')} ref={(input) => this.inputs.imageWidth = input}/>
        { ' ' }
        <NumberInput label="Plot width" value={plotWidth} min={0.0001} step={0.0001}
          onChange={this.changeHandler('plotWidth')} ref={(input) => this.inputs.plotWidth = input}/>
      </p>
      <p>
        <NumberInput label="Plot centre x" value={plotCentreX} step={0.0001}
          onChange={this.changeHandler('plotCentreX')} ref={(input) => this.inputs.plotCentreX = input}/>
        { ' ' }
        <NumberInput label="Plot centre y" value={plotCentreY} step={0.0001}
          onChange={this.changeHandler('plotCentreY')} ref={(input) => this.inputs.plotCentreY = input}/>
      </p>
      <button disabled={!this.isValid() || awaitingPlot} onClick={this.plotIfValid}>Plot Mandelbrot</button>

      <hr/>

      <MandelbrotCanvas plotter={plotter} ref={(canvas) => this.canvas = canvas}/>
    </div>
  }

}
