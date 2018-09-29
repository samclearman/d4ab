import React from 'react'
import Board from './graphics/board'

export default class GraphicsTest extends React.Component {
  constructor() {
    super()
    this.container = React.createRef()
    this.canvas = React.createRef()
    this.board = new Board()
  }

  componentDidMount() {
    this.board.mount(this.container.current, this.canvas.current)
  }

  updateCanvas() {
    this.board.render()
  }

  render() {
    const canvasStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
    }
    return (
      <div ref={this.container}>
        <canvas ref={this.canvas} style={canvasStyle}/>
      </div>
    )
  }
}
