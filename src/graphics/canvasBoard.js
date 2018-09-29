import EventEmitter from 'events'

const DEFAULT_THEME = {
  // https://www.color-hex.com/color/e5f2ff
  gridBackground: '#e5f2ff',
  gridLine: '#b2d9ff',
  colors: [
    '#e5f2ff', // the background
    'blue',
    'red',
    'green',
    'purple',
  ],
}

export default class CanvasBoard extends EventEmitter {
  constructor() {
    super()
    this.rows = 10
    this.cols = 10
    this.theme = DEFAULT_THEME
  }

  get aspectRatio() {
    return this.cols / this.rows
  }

  get cellWidth() {
    return this.width / this.cols
  }

  get cellHeight() {
    return this.height / this.rows
  }

  handleMouseExit = (e) => {
    this.emit('hovercell', null)
  }

  handleMouseMove = (e) => {
    const cellHeight = this.cellHeight
    const cellWidth = this.cellWidth
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const i = y / cellHeight
    const j = x / cellWidth

    this.emit('hovercell', { i, j })
  }

  mount(container, canvas) {
    this.container = container
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
  }

  resize() {
    const canvas = this.canvas
    const bounds = this.container.getBoundingClientRect()
    this.width = Math.min(bounds.width, bounds.height * this.aspectRatio)
    this.height = this.width / this.aspectRatio
    canvas.width = this.width
    canvas.height = this.height
  }

  renderGrid() {
    const canvas = this.canvas
    const ctx = canvas.getContext('2d')

    const cellHeight = this.cellHeight
    const cellWidth = this.cellWidth

    ctx.fillStyle = this.theme.gridBackground
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.strokeStyle = this.theme.gridLine
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 1; i < this.rows; i += 1) {
      ctx.moveTo(0, i * cellHeight)
      ctx.lineTo(this.width, i * cellHeight)
    }
    for (let j = 1; j < this.cols; j += 1) {
      ctx.moveTo(j * cellWidth, 0)
      ctx.lineTo(j * cellWidth, this.height)
    }
    ctx.closePath()
    ctx.stroke()
  }

  renderBoard(board) {
    const canvas = this.canvas,
          ctx = canvas.getContext('2d'),
          cellWidth = this.cellWidth,
          cellHeight = this.cellHeight
    const { cells } = board
    for (const cell of cells) {
      const { i, j, val } = cell
      if (val) {
        ctx.fillStyle = this.theme.colors[val]
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
      }
    }
  }

  render({
    board,
    hoveredCell,
  }) {
    this.resize()
    this.renderGrid()
    this.renderBoard(board)
  }

}

