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
    this.state = {
      board: RANDOM_BOARD,
      cell: null,
      selectedOminoIdx: null,
      pieces: [],
      currentTransformation: {
        rotations: 0,
        flips: 0,
      },
      staged: false,
      theme: ANGELA_THEME,
    }
    this.canvasBoard = new CanvasBoard({
      theme: this.state.theme,
    })
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
    this.canvasBoard.on('clickcell', this.handleClickCell)
    window.addEventListener('keypress', this.handleKeyPress)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  componentWillUnmount() {
    this.canvasBoard.off('hovercell', this.handleHoverCell)
    this.canvasBoard.off('clickcell', this.handleClickCell)
    window.removeEventListener('keypress', this.handleKeyPress)
  }

  get playerIndex() {
    return this.state.board.nextPlayer
  }

  get currentColor() {
    return this.state.theme.colors[this.playerIndex]
  }

  get currentPieceIsValid() {
    const { board, cell, selectedOmino, currentTransformation } = this.state
    if (!cell || !selectedOmino) return false
    return validatePlace(board, this.playerIndex, selectedOmino, currentTransformation, cell.i, cell.j)
  }

  updateCanvasBoard() {
    const { board, cell, selectedOminoIdx, currentTransformation, staged } = this.state
    const cells = board.cells
    const dimensions = {
      rows: board.settings.rows,
      cols: board.settings.cols,
    }
    const currentColor = this.currentColor
    const ghost = (cell && selectedOminoIdx) ? {
      omino: ominos()[selectedOminoIdx],
      transformation: currentTransformation,
      valid: this.currentPieceIsValid,
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
      if (this.currentPieceIsValid) {
        this.setState({
          staged: true,
        })
      }
    }
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleConfirm()
    }
  }

  handleSelectOmino = (selectedOminoIdx) => {
    this.setState({
      selectedOminoIdx,
      cell: null,
      staged: false,
    })
  }

  handleConfirm = () => {
    const cell = this.state.cell
    const { board, selectedOminoIdx, currentTransformation } = this.state
    if (selectedOminoIdx === null) { return }
    if (!this.currentPieceIsValid) { return }
    this.setState({
      board: reducers.place(board, this.playerIndex, selectedOminoIdx, currentTransformation, cell.i, cell.j),
      selectedOminoIdx: null,
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
      <div>
        <div ref={this.container} style={containerStyle}>
          <canvas ref={this.canvas} style={canvasStyle}/>
        </div>

        {this.renderConfirmButton()}
      </div>
    )
  }

  renderConfirmButton() {
    const canConfirm = this.state.staged && this.currentPieceIsValid;
    const buttonStyle = {
      opacity: canConfirm ? 1 : 0.2,
    }

    return (
      <button
        style={buttonStyle}
        onClick={this.handleConfirm}
      >
        Confirm (Enter ↵)
      </button>
    )
  }

  renderOminoSelector() {
    return (
      <OminoSelector
        key={this.playerIndex}
        ominosRemaining={this.state.board.ominosRemaining[this.playerIndex]}
        selectedOminoIdx={this.state.selectedOminoIdx}
        currentColor={this.currentColor}
        onSelectOmino={this.handleSelectOmino}
      />
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
      </div>
    )
  }
}
