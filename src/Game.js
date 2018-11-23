import React from 'react'
import _ from 'lodash'
import CanvasBoard, { ANGELA_THEME, GAME_OVER_THEME } from './graphics/canvasBoard'
import { NEW_BOARD, reducers, validatePlace } from './game/board'
import { getOmino } from './game/ominos'
import OminoSelector from './OminoSelector'
import { eventList } from './game/events'

const SPACES = {
  BOARD: 'board',
  OMINO_SELECTOR: 'omino_selector',
}

export default class Game extends React.PureComponent {
  constructor(props) {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()

    this.state = {
      board: NEW_BOARD,
      cell: null,
      selectedOminoPlayer: 0,
      selectedOminoIdx: 0,
      selectedSpace: SPACES.BOARD,
      pieces: [],
      currentTransformation: {
        rotations: 0,
        flips: 0,
      },
      staged: false,
      theme: ANGELA_THEME,
      claimedPlayers: [],
      requestedPlayers: props.players || [],
      selectorPlayer: 1
    }

    this.canvasBoard = new CanvasBoard({
      theme: this.state.theme,
    })

    this.eventList = eventList(
      () => (this.state),
      (newState) => {this.setState(newState)},
      { gameId: props.gameId },
    )

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
    if (this.state.board.gameOver) {
      this.canvasBoard.set({theme: GAME_OVER_THEME})
    }
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

  get selectedOminoPlayer() {
    return this.state.selectedOminoPlayer
  }

  get nextPlayer() {
    return this.state.board.nextPlayer
  }
  
  get nextClaimedPlayer() {
    for (let i = 0; i < 4; i++) {
      const p = ((this.nextPlayer + i) % 4) || 4
      if (this.state.board.alive[p] && this.state.claimedPlayers.includes(p)) {
        return p
      }
    }
    return 0
  }

  get selectedOminoColor() {
    return this.state.theme.colors[this.selectedOminoPlayer]
  }

  get selectorColor() {
    return this.state.theme.colors[this.state.selectorPlayer]
  }

  get currentPieceIsValid() {
    const { board, cell, selectedOminoIdx, currentTransformation } = this.state
    if (!cell || !selectedOminoIdx) return false
    return validatePlace(board, this.selectedOminoPlayer, selectedOminoIdx, currentTransformation, cell.i, cell.j)
  }

  get canConfirm() {
    return this.state.staged && this.currentPieceIsValid;
  }

  updateCanvasBoard() {
    const { board, cell, selectedOminoIdx, currentTransformation, staged } = this.state
    const cells = board.cells
    const dimensions = {
      rows: board.settings.rows,
      cols: board.settings.cols,
    }
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
      currentColor: this.selectedOminoColor,
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
      if (this.canConfirm) this.handleConfirm()
    } else if (_.includes(['ArrowRight', 'ArrowLeft', 'ArrowUp'], e.key)) {
      this.handleTransformation(e.key)
    } else if (e.key === 'Tab') {
      this.handleToggleSpace()
    } else {
      return
    }
    e.preventDefault()
    e.stopPropagation()
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

  handleSelectOmino = (selectedOminoIdx, selectedOminoPlayer) => {
    this.setState({
      selectedOminoPlayer,
      selectedOminoIdx,
      cell: null,
      staged: false,
      currentTransformation: {
        rotations: 0,
        flips: 0,
      },
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
      selectedOminoIdx: null,
    })

    this.eventList.dispatch({
      type: 'place',
      playerIndex: this.selectedOminoPlayer,
      selectedOminoIdx,
      currentTransformation,
      cell,
    })
  }

  renderTitle() {
    const titleStyle = {
      color: this.state.theme.colors[this.nextClaimedPlayer],
      fontSize: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
    }

    return (
      <div style={titleStyle}>
        Down for a block
      </div>
    );
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
    const buttonStyle = {
      fontFamily: 'Roboto Condensed',
      fontSize: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      opacity: this.canConfirm ? 1 : 0.2,
      cursor: this.canConfirm ? 'pointer' : 'not-allowed',
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

  selectSelector(playerIndex) {
    this.setState({selectorPlayer: playerIndex})
  }
    
  renderOminoSelectorSelectorSelector(playerIndex) {
    const handler = () => {
      this.selectSelector(playerIndex);
    }
    const button = playerIndex === this.state.selectorPlayer ? '■' : '□'
    const style = {
      color: this.state.theme.colors[playerIndex],
      cursor: 'pointer',
      display: 'inline-block',
      fontSize: '20px',
    }
    const textDecorations = []
    if (this.nextPlayer === playerIndex) {
      textDecorations.push('overline')
    }
    if (this.state.claimedPlayers.includes(playerIndex)) {
      textDecorations.push('underline')
    }
    style.textDecoration = textDecorations.join(' ')
    return(
        <div style={style} onClick={handler}>{ button }</div>
    )
  }
  
  renderOminoSelectorSelector() {
    const selectorSelectorSelectors = [1,2,3,4].map(i => this.renderOminoSelectorSelectorSelector(i))
    return ( <div>{ selectorSelectorSelectors }</div> )
  }
  
  renderOminoSelector() {
    const player = this.state.selectorPlayer
    const active = this.state.claimedPlayers.includes(player)
    const selector = active ? this.handleSelectOmino : () => {}
    const selectedIdx = active ? this.state.selectedOminoIdx : 0;
    const color = this.selectorColor
    return (
      <OminoSelector
        active={active}
        key={(10 * active) + player}
        ominosRemaining={this.state.board.ominosRemaining[player]}
        selectedOminoIdx={selectedIdx}
        player={player}
        currentColor={color}
        onSelectOmino={selector}
      />
    )
  }

  render() {
    const containerStyle = {
      display: 'flex',
      alignItems: 'flex-start',
    }

    return (
      <div>
        {this.renderTitle()}
      
        <div style={containerStyle}>
          {this.renderCanvasBoard()}

        <div style={{ width: '60px' }} />
          <div>
            {this.renderOminoSelectorSelector()}
            {this.renderOminoSelector()}
          </div>
        </div>
      </div>
        
    )
  }
}
