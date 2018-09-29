import EventEmitter from 'events'
import { getHexStr8 } from './utils'

const DEFAULT_THEME = {
  // https://www.color-hex.com/color/e5f2ff
  gridBackground: '#e5f2ff',
  gridLine: 'white',
  // gridLine: '#b2d9ff',
  colors: [
    '#e5f2ff', // the background
    'blue',
    'red',
    'green',
    'goldenrod',
  ],
}

export default class CanvasBoard extends EventEmitter {
  constructor() {
    super()
    this.theme = DEFAULT_THEME
  }

  get rows() {
    return this.board.settings.rows
  }

  get cols() {
    return this.board.settings.cols
  }

  get aspectRatio() {
    return this.cols / this.rows
  }

  get cellSize() {
    return this.width / this.cols
  }

  set({
    theme,
    board,
    hoveredCell,
  }) {
    if (theme !== undefined) this.theme = theme
    if (board !== undefined) this.board = board
    if (hoveredCell !== undefined) this.hoveredCell = hoveredCell
  }

  handleMouseExit = (e) => {
    this.emit('hovercell', null)
  }

  handleMouseMove = (e) => {
    const cellSize = this.cellSize
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const i = y / cellSize
    const j = x / cellSize

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

    ctx.fillStyle = this.theme.gridBackground
    ctx.fillRect(0, 0, this.width, this.height)
  }


  renderGridLines() {
    const canvas = this.canvas
    const ctx = canvas.getContext('2d')
    const cellSize = this.cellSize
    ctx.strokeStyle = this.theme.gridLine
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= this.rows; i += 1) {
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(this.width, i * cellSize)
    }
    for (let j = 0; j <= this.cols; j += 1) {
      ctx.moveTo(j * cellSize, 0)
      ctx.lineTo(j * cellSize, this.height)
    }
    ctx.closePath()
    ctx.stroke()
  }

  renderCell(i, j, color) {
    const canvas = this.canvas,
          ctx = canvas.getContext('2d'),
          cellSize = this.cellSize
    const strokeWidth = cellSize * 0.2
    ctx.lineWidth = strokeWidth
    console.log(strokeWidth)
    const x = i * cellSize
    const y = j * cellSize
    ctx.fillStyle = getHexStr8(color, 1.0)
    ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = getHexStr8('white', 0.4)
    ctx.fillRect(x, y, cellSize, cellSize)
  }

  renderBoard() {
    const board = this.board
    const { cells } = board
    for (const cell of cells) {
      const { i, j, val } = cell
      if (val) {
        this.renderCell(i, j, this.theme.colors[val])
      }
    }
  }

  render() {
    this.resize()
    this.renderGrid()
    this.renderBoard()
    this.renderGridLines()
  }

}

