
import preact from 'preact'

/** @jsx preact.h */

export default class NumberInput extends preact.Component {
  handleChange = (e) => {
    this.props.onChange(e.target.valueAsNumber)
  }

  isValid = () => this.input.validity.valid

  // TODO set class and do validity styling - see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number
  render = ({ label, value, min, step = 1 }) => {
    return <label>
      { label }:{ ' ' }
      <input type="number" value={value} min={min} step={step} required
        onChange={this.handleChange}
        ref={(input) => this.input = input}
      />
    </label>
  }
}
