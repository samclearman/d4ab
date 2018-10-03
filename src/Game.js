import React from 'react'
import _ from 'lodash'
import CanvasBoard, { ANGELA_THEME } from './graphics/canvasBoard'
import { RANDOM_BOARD, reducers, validatePlace } from './game/board'
import { ominos } from './game/ominos'
import OminoSelector from './OminoSelector'

export default class Game extends React.PureComponent {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.canvasBoard = new CanvasBoard()
    this.state = {
      board: RANDOM_BOARD,
      cell: null,
      selectedOmino: null,
      pieces: [],
      currentTransformation: {
        rotations: 0,
        flips: 0,
      },
      staged: false,
      theme: ANGELA_THEME,
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
      8,
      3
    );
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
    this.canvasBoard.on('clickcell', this.handleClickCell)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  componentWillUnmount() {
    this.canvasBoard.off('hovercell', this.handleHoverCell)
    this.canvasBoard.off('clickcell', this.handleClickCell)
  }

  get playerIndex() {
    return this.state.board.nextPlayer
  }

  get currentColor() {
    return this.state.theme.colors[this.playerIndex]
  }

  updateCanvasBoard() {
    const { board, cell, selectedOmino, currentTransformation, staged } = this.state
    const cells = board.cells
    const dimensions = {
      rows: board.settings.rows,
      cols: board.settings.cols,
    }
    const currentColor = this.currentColor
    const ghost = (cell && selectedOmino) ? {
      omino: selectedOmino,
      transformation: currentTransformation,
      valid: validatePlace(board, this.playerIndex, selectedOmino, currentTransformation, cell.i, cell.j),
      staged,
      cell,
    } : null
    this.canvasBoard.set({
      dimensions,
      cells,
      currentColor,
      ghost,
    })
    this.canvasBoard.render()
  }

  handleHoverCell = (cell) => {
    if (this.state.staged) { return }
    if (_.isEqual(cell, this.state.cell)) { return }
    this.setState({
      cell
    })
  }

  handleTouchUpCell = (cell) => {
    this.setState({
      staged: true,
    })
  }

  handleTouchMoveCell = (cell) => {
    this.setState({
      cell
    })
  }

  handleTouchDownCell = (cell) => {
    this.setState({
      staged: false,
    }, () => {
      this.handleHoverCell(cell)
    })
  }

  handleClickCell = (cell) => {
    if (this.state.staged) {
      this.setState({
        staged: false,
      }, () => {
        this.handleHoverCell(cell)
      })
    } else {
      this.setState({
        staged: true,
      })
    }
  }

  handleSelectOmino = (selectedOmino) => {
    this.setState({
      selectedOmino,
      cell: null,
      staged: false,
    })
  }

  handleConfirm = () => {
    const cell = this.state.cell
    const { board, selectedOmino, currentTransformation } = this.state
    if (!selectedOmino) { return }
    if (!validatePlace(board, this.playerIndex, selectedOmino, currentTransformation, cell.i, cell.j)) { return }
    this.setState({
      board: reducers.place(board, this.playerIndex, selectedOmino, currentTransformation, cell.i, cell.j),
      selectedOmino: null,
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
      width: 600,
      height: 600,
      position: 'relative',
    }
    return (
      <div ref={this.container} style={containerStyle}>
        <canvas ref={this.canvas} style={canvasStyle}/>
      </div>
    )
  }

  renderConfirmButton() {
    const buttonStyle = {
    }

    return (
      <button
        style={buttonStyle}
        onClick={this.handleConfirm}
      >
        Confirm
      </button>
    )
  }

  renderOminoSelector() {
    return (
      <OminoSelector
        ominos={this.state.board.ominosRemaining[this.playerIndex]}
        selectedOmino={this.state.selectedOmino}
        currentColor={this.currentColor}
        onSelectOmino={this.handleSelectOmino} />
    )
  }

  render() {
    const containerStyle = {
      display: 'flex',
    }

    return (
      <div style={containerStyle}>
        {this.renderCanvasBoard()}
        <div style={{ width: '60px' }} />
        {this.renderOminoSelector()}
        {this.renderConfirmButton()}
      </div>
    )
  }
}
