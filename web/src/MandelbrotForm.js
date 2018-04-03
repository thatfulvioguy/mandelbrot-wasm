
import preact from 'preact'

import NumberInput from './NumberInput'
import MandelbrotCanvas from './MandelbrotCanvas'

/** @jsx preact.h */

const DEFAULTS = {
  imageWidth: 720,
  plotWidth: 2.5,
  plotCentreX: -0.66,
  plotCentreY: 0
}

export default class MandelbrotForm extends preact.Component {

  constructor(props) {
    super(props)
    this.state = DEFAULTS
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

    console.log(`plot: ${JSON.stringify(this.state)}`)
    this.canvas.plot({ ...this.state })
  }

  render({ plotter }, { imageWidth, plotWidth, plotCentreX, plotCentreY }) {
    console.log(`rendering form with state: ${JSON.stringify(this.state)}`)
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
      <button disabled={!this.isValid()} onClick={this.plotIfValid}>Plot Mandelbrot</button>

      <hr/>

      <MandelbrotCanvas plotter={plotter} ref={(canvas) => this.canvas = canvas}/>
    </div>
  }

}
