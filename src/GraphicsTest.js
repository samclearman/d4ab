import React from 'react'
import _ from 'lodash'
import CanvasBoard from './graphics/canvasBoard'
import { RANDOM_BOARD, reducers } from './game/board'
import { ominos } from './game/ominos'
import OminoSelector from './OminoSelector'

export default class GraphicsTest extends React.PureComponent {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      board: RANDOM_BOARD,
      hoveredCell: null,
      selectedOmino: null,
      currentColor: 'red',
      pieces: [],
    }
    this.state.board = reducers.place(
      this.state.board,
      1,
      ominos()[5],
      { rotations: 1, flips: 1 },
      2,
      3
    );
    this.state.board = reducers.place(
      this.state.board,
      2,
      ominos()[5],
      { rotations: 1, flips: 0 },
      2,
      3
    );
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  get playerIndex() {
    return this.state.board.nextPlayer
  }

  updateCanvasBoard() {
    const { board, hoveredCell, currentColor } = this.state
    this.canvasBoard.set({
      board,
      currentColor,
      hoveredCell,
    })
    this.canvasBoard.render()
  }

  handleHoverCell = (hoveredCell) => {
    if (_.isEqual(hoveredCell, this.state.hoveredCell)) return
    this.setState({
      hoveredCell
    })
  }

  handleSelectOmino = (selectedOmino) => {
    this.setState({
      selectedOmino,
    })
  }

  renderCanvasBoard() {
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

  renderOminoSelector() {
    return (
      <OminoSelector
        ominos={this.state.board.ominosRemaining[this.playerIndex]}
        selectedOmino={this.state.selectedOmino}
        currentColor={this.state.currentColor}
        onSelectOmino={this.handleSelectOmino} />
    )
  }

  render() {
    return (
      <div>
        {this.renderCanvasBoard()}
        {this.renderOminoSelector()}
      </div>
    )
  }
}
