import React from 'react'
import _ from 'lodash'
import CanvasBoard, { RILKA_THEME, GAME_OVER_THEME } from './graphics/canvasBoard'
import { NEW_BOARD, reducers, validatePlace } from './game/board'
import { getOmino } from './game/ominos'
import OminoSelector from './OminoSelector'
import { eventList } from './game/events'

const SPACES = {
  BOARD: 'board',
  OMINO_SELECTOR: 'omino_selector',
}

async function notify(message) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    return
  }

  if (!['denied', 'granted'].includes(Notification.permission)) {
    await Notification.requestPermission()
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(
      message,
      {
        icon: '/d4ac.png'
      }
    )
    const w = window
    notification.onclick = function() { w.focus(); notification.close() }
  }
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
        rotations: 2,
        flips: 0,
      },
      staged: false,
      theme: RILKA_THEME,
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

  componentDidUpdate(prevProps, prevState) {
    if (this.state.board.gameOver) {
      this.canvasBoard.set({theme: GAME_OVER_THEME})
    }
    this.updateCanvasBoard()
    if (this.state.board && prevState && prevState.board && this.state.board.nextPlayer !== prevState.board.nextPlayer &&
        this.state.claimedPlayers.includes(this.state.board.nextPlayer)) {
      notify(`It's your turn to block`)
    }
  }

  componentWillUnmount() {
    // this.canvasBoard.off('hovercell', this.handleHoverCell)
    // this.canvasBoard.off('clickcell', this.handleClickCell)
    // this.canvasBoard.off('touchstartcell', this.handleTouchStartCell)
    // this.canvasBoard.off('touchmovecell', this.handleTouchMoveCell)
    // this.canvasBoard.off('touchend', this.handleTouchEnd)

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
    } else if (e.key === '/') {
      this.handleCycleSelector()
    } else {
      return
    }
    e.preventDefault()
    e.stopPropagation()
  }

  rotate = (dr) => {
    this.setState(prevState => {
      let { rotations, flips } = prevState.currentTransformation
      dr *= Math.pow(-1, flips)
      rotations = (rotations + dr + 4) % 4
      return { currentTransformation: { rotations, flips } }
    }, this.updateCanvasBoard)
  }

  rotateLeft = () => {
    this.rotate(-1)
  }

  rotateRight = () => {
    this.rotate(1)
  }

  flip = () => {
    this.setState(prevState => {
      let { rotations, flips } = prevState.currentTransformation
      flips = (flips + 1) % 2;
      return { currentTransformation: { rotations, flips } }
    }, this.updateCanvasBoard)
  }
      
  handleTransformation = (transformation) => {
    switch(transformation) {
    case 'ArrowUp':
      this.flip()
      break
    case 'ArrowLeft':
      this.rotateLeft()
      break
    case 'ArrowRight':
      this.rotateRight()
      break
    }
  }

  handleSelectOmino = (selectedOminoIdx, selectedOminoPlayer) => {
    this.setState({
      selectedOminoPlayer,
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

    let { selectorPlayer }  = this.state
    if (this.state.claimedPlayers.length > 1) {
      selectorPlayer = this.state.claimedPlayers[(this.state.claimedPlayers.indexOf(this.state.selectedOminoPlayer) + 1) % this.state.claimedPlayers.length]
    }
    this.setState({
      selectedOminoIdx: null,
      selectorPlayer,
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
      height: '50px',
    }

    return (
      <div style={titleStyle}>
        Down for a block
      </div>
    );
  }
  
  renderCanvasBoard() {
    const canvasStyle = {
      width: '500px',
      height: '500px',
      maxWidth: '100vw',
      maxHeight: '100vw',
      // position: 'absolute',
      // top: '50%',
      // left: '50%',
      // transform: 'translateX(-50%) translateY(-50%)'
    }

    const containerStyle = {
      // margin: '30px auto',
      // position: 'relative',
      width: '500px',
      maxWidth: '100vw',
    }
    
    const palletStyle = {
      display: 'flex',
      justifyContent: 'space-around',
    }
    
    return (
      <div>
        <div ref={this.container} style={containerStyle}>
          <canvas ref={this.canvas} style={canvasStyle}/>
        </div>
        <div style={palletStyle}>
          {this.renderConfirmButton()}
          {this.renderControls()}
        </div>
      </div>
    )
  }

  renderControls() {
    const ominoSelected = !!this.state.selectedOminoIdx
    const controlsStyle = {
      fontFamily: 'Roboto Condensed',
      fontSize: '30px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      cursor: 'pointer',
    }
    const controlStyle = {
      display: 'inline-block',
      paddingRight: '10px',
    }
    return (
      <div style={controlsStyle}>
        <div style={controlStyle} onClick={this.rotateLeft}>↪️</div>
        <div style={controlStyle} onClick={this.flip}>🔃</div>
        <div style={controlStyle} onClick={this.rotateRight}>↩️</div>
      </div>
    )
  }
  
  renderConfirmButton() {
    const buttonStyle = {
      fontFamily: 'Roboto Condensed',
      marginTop: '10px',
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
        Confirm
      </div>
    )
  }

  handleCycleSelector() {
    const next = ((this.state.selectorPlayer + 1) % 4) || 4
    this.selectSelector(next)
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
      fontSize: '40px',
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
    const style = {
      height: '50px',
    }
    const selectorSelectorSelectors = [1,2,3,4].map(i => this.renderOminoSelectorSelectorSelector(i))
    return ( <div style={style} >{ selectorSelectorSelectors }</div> )
  }
  
  renderOminoSelector() {
    const player = this.state.selectorPlayer
    const active = this.state.claimedPlayers.includes(player)
    const selector = active ? this.handleSelectOmino : () => {}
    const selectedIdx = player === this.state.selectedOminoPlayer ? this.state.selectedOminoIdx : 0;
    const color = this.selectorColor
    return (
      <OminoSelector
        active={active}
        ominosRemaining={this.state.board.ominosRemaining[player]}
        selectedOminoIdx={selectedIdx}
        currentTransformation={this.state.currentTransformation}
        player={player}
        currentColor={color}
        onSelectOmino={selector}
      />
    )
  }

  render() {
    const appStyle = {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'scroll',
      scrollSnapType: 'x mandatory',
    };
                
    const containerStyle = {
      display: 'flex',
      alignItems: 'flex-start',
    }

    const thinCol = {
      flexGrow: 3,
    }

    const thickCol = {
      flexGrow: 1,
    }

    const snapTarget = {
      scrollSnapAlign: 'start',
    }
    
    return (
        <div className="App" style={appStyle}>
          <div style={thinCol}></div>
          <div style={snapTarget}>
            {this.renderTitle()}
            <div style={containerStyle}>
              {this.renderCanvasBoard()}
            </div>
          </div>
          <div style={thickCol}></div>
          <div style={snapTarget}>
            {this.renderOminoSelectorSelector()}
            {this.renderOminoSelector()}
          </div>
          <div style={thinCol}></div>
        </div>
    )
  }
}
