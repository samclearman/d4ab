import React from 'react'
import _ from 'lodash'
import CanvasBoard, { makeTheme } from './graphics/canvasBoard'
import GestureListener from './GestureListener'
import { reducers } from './game/board'
import { unpadded } from './game/ominos'

class OminoCanvas extends React.PureComponent {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      isHovering: false,
    }
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  get rows() {
    const { omino } = this.props
    const unpaddedOmino = unpadded(omino)
    return unpaddedOmino.length
  }

  get cols() {
    const { omino } = this.props
    const unpaddedOmino = unpadded(omino)
    return unpaddedOmino[0].length
  }

  updateCanvasBoard() {
    const { omino, currentColor } = this.props
    if (!omino) return
    const unpaddedOmino = unpadded(omino)
    const dimensions = {
      rows: this.rows,
      cols: this.cols,
    }
    const cells = []
    unpaddedOmino.forEach((row, i) => row.forEach((val, j) => {
      cells.push({
        i,
        j,
        val,
      })
    }))
    const theme = makeTheme(currentColor)
    this.canvasBoard.set({
      dimensions,
      cells,
      theme,
    })
    this.canvasBoard.render()
  }

  handleHoverIn = () => {
    this.setState({
      isHovering: true,
    })
  }

  handleHoverOut = () => {
    this.setState({
      isHovering: false,
    })
  }

  handleClick = () => {
    this.props.onSelect(this.props.omino)
  }

  render() {
    const canvasStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-50%)',
    }

    const containerStyle = {
      margin: '30px',
      width: this.cols * 20,
      height: this.rows * 20,
      position: 'relative',
      cursor: 'pointer',
      opacity: this.props.isSelected ? 1 : (this.state.isHovering ? 0.5 : 0.2),
      transition: 'all 0.2s',
    }

    return (
      <div ref={this.container} style={containerStyle}>
        <GestureListener onClick={this.handleClick}>
          <canvas ref={this.canvas} style={canvasStyle} onMouseEnter={this.handleHoverIn} onMouseLeave={this.handleHoverOut}/>
        </GestureListener>
      </div>
    )
  }
}

export default class OminoSelector extends React.PureComponent {
  componentDidMount = () => {
    this.props.onSelectOmino(this.props.ominos[this.props.ominos.length - 1])
  }

  handleSelect = omino => {
    this.props.onSelectOmino(omino)
  }

  render() {
    const containerStyle = {
      display: 'grid',
      gridTemplateColumns: 'auto auto auto',
    }
    return (
      <div style={containerStyle}>
        {_.map(this.props.ominos, (omino, i) => (
          <OminoCanvas
            key={i}
            omino={omino}
            currentColor={this.props.currentColor}
            isSelected={this.props.selectedOmino === omino}
            onSelect={this.handleSelect}
            onHoverIn={this.handleHoverIn}
            onHoverOut={this.handleHoverOut}/>
        ))}
      </div>
    )
  }
}

