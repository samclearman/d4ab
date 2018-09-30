import React from 'react'
import _ from 'lodash'
import CanvasBoard from './graphics/canvasBoard'
import { RANDOM_BOARD, reducers } from './game/board'
import { ominos } from './game/ominos'
import PieceSelector from './PieceSelector'

export default class GraphicsTest extends React.PureComponent {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      board: RANDOM_BOARD,
      hoveredCell: null,
      selectedPiece: null,
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
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
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

  handleSelectPiece = (selectedPiece) => {
    this.setState({
      selectedPiece,
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

  renderPieceSelector() {
    return (
      <PieceSelector
        pieces={this.state.pieces}
        selectedPiece={this.state.selectedPiece}
        onSelectPiece={this.handleSelectPiece} />
    )
  }

  render() {
    return (
      <div>
        {this.renderCanvasBoard()}
        {this.renderPieceSelector()}
      </div>
    )
  }
}
