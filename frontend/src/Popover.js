import React, { Component } from 'react'
import ReactDOM from 'react-dom'

/**
 * A component that represents a button and a box that appears when the button is clicked/hovered over.
 */
class Popover extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
    }

    this.onToggle = this.onToggle.bind(this)
    this.onHide = this.onHide.bind(this)
  }

  componentDidMount() {
    if (!this.props.hover) {
      document.addEventListener('click', this.onHide)
    }
    if (!this.dialogElement) {
      this.dialogElement = document.createElement('div')
      this.dialogElement.style.position = 'static'
      document.body.appendChild(this.dialogElement)
      this.componentDidUpdate()
    }
  }

  componentWillUnmount() {
    if (!this.props.hover) {
      document.removeEventListener('click', this.onHide)
    }
    document.body.removeChild(this.dialogElement)
  }

  onHide(e) {
    if (!this.refs.button) {
      return
    }
    const buttonElement = ReactDOM.findDOMNode(this.refs.button)
    if (buttonElement.contains(e.target)) {
      return
    }
    if (!this.dialogElement.contains(e.target)) {
      this.setState({
        isShown: false,
      })
    }
  }

  onToggle(val) {
    const { left, bottom } = ReactDOM.findDOMNode(
      this.refs.button
    ).getBoundingClientRect()
    this.setState(({ isShown }) => ({
      isShown: typeof val === 'undefined' ? !isShown : val,
      position: [left, bottom],
    }))
  }

  componentDidUpdate() {
    const { isShown, position = [] } = this.state
    const [top, left] = position
    const { style, children } = this.props
    ReactDOM.render(
      isShown ? (
        <div
          className="msg"
          style={{
            ...style,
            top: top && top + window.scrollY,
            left: left && left + window.scrollX,
          }}
        >
          {children}
        </div>
      ) : null,
      this.dialogElement
    )
  }

  render() {
    const { hover, button } = this.props
    return (
      <span
        ref="button"
        style={{ cursor: 'pointer' }}
        onClick={!hover ? () => this.onToggle() : undefined}
        onMouseEnter={hover ? () => this.onToggle(true) : undefined}
        onMouseLeave={hover ? () => this.onToggle(false) : undefined}
      >
        {button || <button>Toggle</button>}
      </span>
    )
  }
}

const PopoverTitle = ({ children, title }) => (
  <Popover hover button={children}>
    {title}
  </Popover>
)

export { PopoverTitle }
export default Popover
