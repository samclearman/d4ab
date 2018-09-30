import React from 'react'
import CanvasBoard from './graphics/canvasBoard'
import { RANDOM_BOARD, reducers } from './game/board'
import { ominos } from './game/ominos'

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
    this.state.board = reducers.place(
      this.state.board,
      1,
      ominos()[2],
      { rotations: 1, flips: 1 },
      2,
      3
    );
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.updateCanvasBoard()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
  }

  updateCanvasBoard() {
    const { board, hoveredCell } = this.state
    this.canvasBoard.render({
      board,
      hoveredCell,
    })
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
      width: 400,
      height: 300,
      position: 'relative',
    }
    return (
      <div ref={this.container} style={containerStyle}>
        <canvas ref={this.canvas} style={canvasStyle}/>
      </div>
    )
  }
}
