import React from 'react'
import _ from 'lodash'
import CanvasBoard, { makeTheme } from './graphics/canvasBoard'
import { getOmino, unpadded, transformed } from './game/ominos'

class OminoCanvas extends React.PureComponent {
  constructor(props) {
    super(props)
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      isHovering: false,
    }
    this.unpaddedOmino = transformed(getOmino(props.ominoIdx), props.currentTransformation)
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if(nextProps.currentTransformation) {
      this.unpaddedOmino = transformed(getOmino(this.props.ominoIdx), nextProps.currentTransformation)
    }
  }
  
  //   if (this.canvas.current.style) {
  //     this.canvas.current.style.height = nextProps.rows * 20
  //     this.canvas.current.style.width = nextProps.cols * 20
  //   }
  // }
  
  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  get rows() {
    return this.unpaddedOmino.length
  }

  get cols() {
    return Math.max(...this.unpaddedOmino.map(r => r.length))
  }

  updateCanvasBoard() {
    const dimensions = {
      rows: this.rows,
      cols: this.cols,
    }
    const cells = []
    this.unpaddedOmino.forEach((row, i) => row.forEach((val, j) => {
      cells.push({
        i,
        j,
        val,
      })
    }))
    const theme = makeTheme(this.props.currentColor)
    this.canvasBoard.set({
      dimensions,
      cells,
      theme,
    })
    this.canvasBoard.render()

  }

  handleHoverIn = () => {
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
      padding: '10px',
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
  handleSelect = ominoIdx => {
    this.props.onSelectOmino(ominoIdx, this.props.player)
  }

  render() {
    const containerStyle = {
      display: 'grid',
      gridTemplateColumns: 'auto auto auto auto',
    }
    
    return (
      <div style={containerStyle}>
        {_.keys(this.props.ominosRemaining).map((ominoIdx, i) => ( this.props.ominosRemaining[ominoIdx] &&
          <OminoCanvas
            key={ominoIdx}
            ominoIdx={ominoIdx}
            active={this.props.active}
            currentColor={this.props.currentColor}
            currentTransformation={this.props.currentTransformation}
            isSelected={this.props.selectedOminoIdx === ominoIdx}
            onSelect={this.handleSelect}
            onHoverIn={this.handleHoverIn}
            onHoverOut={this.handleHoverOut}/>
        ))}
      </div>
    )
  }
}

