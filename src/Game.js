import React from 'react'
import _ from 'lodash'
import CanvasBoard, { ANGELA_THEME } from './graphics/canvasBoard'
import { RANDOM_BOARD, reducers, validatePlace } from './game/board'
import { getOmino } from './game/ominos'
import OminoSelector from './OminoSelector'

const SPACES = {
  BOARD: 'board',
  OMINO_SELECTOR: 'omino_selector',
}

export default class Game extends React.PureComponent {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()

    this.state = {
      board: RANDOM_BOARD,
      cell: null,
      selectedOminoIdx: null,
      selectedSpace: SPACES.BOARD,
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

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
    this.canvasBoard.on('clickcell', this.handleClickCell)
    this.canvasBoard.on('touchstartcell', this.handleTouchStartCell)
    this.canvasBoard.on('touchmovecell', this.handleTouchMoveCell)
    this.canvasBoard.on('touchend', this.handleTouchEnd)
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  componentWillUnmount() {
    this.canvasBoard.off('hovercell', this.handleHoverCell)
    this.canvasBoard.off('clickcell', this.handleClickCell)
    this.canvasBoard.off('touchstartcell', this.handleTouchStartCell)
    this.canvasBoard.off('touchmovecell', this.handleTouchMoveCell)
    this.canvasBoard.off('touchend', this.handleTouchEnd)

    window.removeEventListener('keydown', this.handleKeyDown)
  }

  get playerIndex() {
    return this.state.board.nextPlayer
  }

  get currentColor() {
    return this.state.theme.colors[this.playerIndex]
  }

  get currentPieceIsValid() {
    console.log('valid?')
    const { board, cell, selectedOminoIdx, currentTransformation } = this.state
    if (!cell || !selectedOminoIdx) return false
    return validatePlace(board, this.playerIndex, selectedOminoIdx, currentTransformation, cell.i, cell.j)
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
      omino: getOmino(selectedOminoIdx),
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

  handleTouchStartCell = (cell) => {
    this.setState({
      staged: false,
    }, () => {
      this.handleHoverCell(cell)
    })
  }

  handleTouchMoveCell = (cell) => {
    this.setState({
      cell
    })
  }

  handleTouchEnd = (cell) => {
    if (this.currentPieceIsValid) {
      this.setState({
        staged: true,
      })
    }
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

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.handleConfirm()
    } else if (_.includes(['ArrowRight', 'ArrowLeft', 'ArrowUp'], e.key)) {
      this.handleTransformation(e.key)
    } else if (e.key === 'Tab') {
      this.handleToggleSpace()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  handleTransformation = (transformation) => {
    this.setState(prevState => {
      let { rotations, flips } = prevState.currentTransformation;
      if (transformation === 'ArrowUp') {
        flips = (flips + 1) % 2;
      } else {
        let dr = (transformation === 'ArrowRight') ? 1 : -1;
        dr *= Math.pow(-1, flips);
        rotations = (rotations + dr + 4) % 4;
      }
      return { currentTransformation: { flips, rotations } };
    }, this.updateCanvasBoard);
  }

  handleSelectOmino = (selectedOminoIdx) => {
    this.setState({
      selectedOminoIdx,
      cell: null,
      staged: false,
    })
  }

  handleToggleSpace = () => {
    this.setState({
      selectedSpace: this.state.selectedSpace === SPACES.BOARD ? SPACES.OMINO_SELECTOR : SPACES.BOARD,
    })
  }

  handleConfirm = () => {
    const cell = this.state.cell
    const { board, selectedOminoIdx, currentTransformation } = this.state
    if (!selectedOminoIdx) { return }
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
      fontFamily: 'Roboto Condensed',
      fontSize: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      opacity: canConfirm ? 1 : 0.2,
      cursor: canConfirm ? 'pointer' : 'not-allowed',
    }

    return (
      <div
        style={buttonStyle}
        onClick={this.handleConfirm}
      >
        Confirm <em>[Enter ↵]</em>
      </div>
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
