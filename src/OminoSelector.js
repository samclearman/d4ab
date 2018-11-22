import React from 'react'
import _ from 'lodash'
import CanvasBoard, { makeTheme } from './graphics/canvasBoard'
import { getOmino, unpadded } from './game/ominos'

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
    const { ominoIdx } = this.props
    const omino = getOmino(ominoIdx);
    const unpaddedOmino = unpadded(omino)
    return unpaddedOmino.length
  }

  get cols() {
    const { ominoIdx } = this.props
    const omino = getOmino(ominoIdx);
    if (!omino) debugger
    const unpaddedOmino = unpadded(omino)
    return unpaddedOmino[0].length
  }

  updateCanvasBoard() {
    const { ominoIdx, currentColor } = this.props
    const omino = getOmino(ominoIdx)
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
    console.log(this.props.active);
    if (!this.props.active) {
      return
    }
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
    this.props.onSelect(this.props.ominoIdx)
  }

  render() {
    const containerStyle = {
      padding: '32px',
      opacity: this.props.isSelected ? 1 : (this.state.isHovering ? 0.5 : 0.2),
      transition: 'all 0.2s',
      cursor: 'pointer',
    }

    const canvasStyle = {
      width: this.cols * 20,
      height: this.rows * 20,
    }

    return (
      <div
        ref={this.container}
        style={containerStyle}
        onClick={this.handleClick}
        onMouseEnter={this.handleHoverIn}
        onMouseLeave={this.handleHoverOut}
      >
        <canvas
          ref={this.canvas}
          style={canvasStyle}
        />
      </div>
    )
  }
}

export default class OminoSelector extends React.PureComponent {
  componentDidMount = () => {
    this.props.onSelectOmino(_.findLast(_.keys(this.props.ominosRemaining), k => this.props.ominosRemaining[k]));
  }

  handleSelect = ominoIdx => {
    this.props.onSelectOmino(ominoIdx)
  }

  render() {
    const containerStyle = {
      display: 'grid',
      gridTemplateColumns: 'auto auto auto',
    }

    return (
      <div style={containerStyle}>
        {_.keys(this.props.ominosRemaining).map((ominoIdx, i) => ( this.props.ominosRemaining[ominoIdx] &&
          <OminoCanvas
            key={ominoIdx}
            ominoIdx={ominoIdx}
            active={this.props.active}
            currentColor={this.props.currentColor}
            isSelected={this.props.selectedOminoIdx === ominoIdx}
            onSelect={this.handleSelect}
            onHoverIn={this.handleHoverIn}
            onHoverOut={this.handleHoverOut}/>
        ))}
      </div>
    )
  }
}

