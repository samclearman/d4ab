import React from 'react'
import _ from 'lodash'
import CanvasBoard from './graphics/canvasBoard'

class PieceCanvas extends React.PureComponent {
  componentDidMount() {
    this.canvasBoard.mount(this.container.current, this.canvas.current)
    this.componentDidUpdate()
    this.canvasBoard.on('hovercell', this.handleHoverCell)
  }

  componentDidUpdate() {
    this.updateCanvasBoard()
  }

  updateCanvasBoard() {
    const { piece, currentColor } = this.props
    const cells = piece.cells
    const board = {
      settings: {
        rows: piece.rows,
        cols: piece.cols,
      },
      cells,
    }
    this.canvasBoard.set({
      board,
      currentColor,
    })
    this.canvasBoard.render()
  }

  handleHover = () => {
    this.props.onHover(this.props.piece)
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
        <canvas ref={this.canvas} style={canvasStyle} onHover={this.handleHover}/>
      </div>
    )
  }
}

export default class PieceSelector extends React.PureComponent {

  handleHover = piece => {
    console.log('HANDLE HOVER', piece)
  }

  render() {
    return (
      <div>
        {_.map(this.props.pieces, (piece, i) => (
          <PieceCanvas
            key={i}
            piece={piece}
            currentColor={this.props.currentColor}
            isSelected={this.props.selectedPiece === piece}
            onHover={this.handleHover} />
        ))}
      </div>
    )
  }
}

