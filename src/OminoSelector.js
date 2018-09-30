import React from 'react'
import _ from 'lodash'
import CanvasBoard from './graphics/canvasBoard'
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

  updateCanvasBoard() {
    const { omino, currentColor } = this.props
    if (!omino) return
    const unpaddedOmino = unpadded(omino)
    const board = reducers.place(
      reducers.initialize(null, unpaddedOmino[0].length, unpaddedOmino.length),
      1,
      unpaddedOmino,
      { rotations: 0, flips: 0 },
      0,
      0,
    );
    this.canvasBoard.set({
      board,
      currentColor,
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

  render() {
    const canvasStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-50%)'
    }

    const containerStyle = {
      margin: '30px auto',
      width: 50,
      height: 50,
      position: 'relative',
    }


    return (
      <div ref={this.container} style={containerStyle}>
        <canvas ref={this.canvas} style={canvasStyle} onMouseEnter={this.handleHoverIn} onMouseLeave={this.handleHoverOut}/>
      </div>
    )
  }
}

export default class OminoSelector extends React.PureComponent {
  handleClick = omino => {
    this.props.onSelectOmino(omino)
  }

  render() {
    const containerStyle = {
      display: 'flex',
      flexWrap: 'wrap',
    }
    return (
      <div style={containerStyle}>
        {_.map(this.props.ominos, (omino, i) => (
          <OminoCanvas
            key={i}
            omino={omino}
            currentColor={this.props.currentColor}
            isSelected={this.props.selectedOmino === omino}
            onHoverIn={this.handleHoverIn}
            onHoverOut={this.handleHoverOut}/>
        ))}
      </div>
    )
  }
}

