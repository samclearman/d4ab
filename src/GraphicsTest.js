import React from 'react'
import CanvasBoard from './graphics/canvasBoard'
import { RANDOM_BOARD } from './game/board'

export default class GraphicsTest extends React.Component {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      board: RANDOM_BOARD,
      hoveredCell: null,
    }
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.updateCanvasBoard()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
  }

  updateCanvasBoard() {
    const { board, hoveredCell } = this.state
    this.canvasBoard.set({
      board,
      hoveredCell,
    })
    this.canvasBoard.render()
  }

  handleHoverCell = (hoveredCell) => {
    this.setState({
      hoveredCell
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
      width: 800,
      height: 800,
      position: 'relative',
    }
    return (
      <div ref={this.container} style={containerStyle}>
        <canvas ref={this.canvas} style={canvasStyle}/>
      </div>
    )
  }
}
