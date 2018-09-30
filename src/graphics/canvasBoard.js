import EventEmitter from 'events'
import { getHexStr8 } from './utils'

export const DEFAULT_THEME = {
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

export const makeTheme = (color) => ({
  gridBackground: 'white',
  gridLine: 'white',
  colors: [
    'white',
    color,
  ],
})

export default class CanvasBoard extends EventEmitter {
  constructor({
    theme = DEFAULT_THEME
  } = {}) {
    super()
    this.theme = theme
    this.cells = null
    this.dimensions = null
    this.ghost = null
    this.currentColor = null
  }

  get rows() {
    return this.dimensions.rows
  }

  get cols() {
    return this.dimensions.cols
  }

  get aspectRatio() {
    return this.cols / this.rows
  }

  get cellSize() {
    return this.width / this.cols
  }

  set({
    theme,
    cells,
    dimensions,
    ghost,
    currentColor,
  }) {
    if (theme !== undefined) this.theme = theme
    if (cells !== undefined) this.cells = cells
    if (dimensions !== undefined) this.dimensions = dimensions
    if (ghost !== undefined) this.ghost = ghost
    if (currentColor !== undefined) this.currentColor = currentColor
  }

  handleMouseExit = (e) => {
    this.emit('hovercell', null)
  }

  handleClick = (e) => {
    const cellSize = this.cellSize
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const i = Math.floor(y / cellSize)
    const j = Math.floor(x / cellSize)
    this.emit('clickcell', { i, j })
  }

  handleMouseMove = (e) => {
    const cellSize = this.cellSize
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const i = Math.floor(y / cellSize)
    const j = Math.floor(x / cellSize)

    this.emit('hovercell', { i, j })
  }

  mount(container, canvas) {
    this.container = container
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('click', this.handleClick)
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

  renderCell(i, j, color, { ghost = false, valid = false } = {} ) {
    const canvas = this.canvas,
          ctx = canvas.getContext('2d'),
          cellSize = this.cellSize
    const x = j * cellSize
    const y = i * cellSize
    if (ghost) {
      if (valid) {
        ctx.fillStyle = getHexStr8(color, 0.6)
        ctx.fillRect(x, y, cellSize, cellSize)
        ctx.fillStyle = getHexStr8('#cccccc', 0.6)
        ctx.fillRect(x, y, cellSize, cellSize)
      } else {
        ctx.fillStyle = getHexStr8('#cccccc', 0.6)
        ctx.fillRect(x, y, cellSize, cellSize)
      }
    } else {
      ctx.fillStyle = getHexStr8(color, 1.0)
      ctx.fillRect(x, y, cellSize, cellSize)
      ctx.fillStyle = getHexStr8('white', 0.5)
      ctx.fillRect(x, y, cellSize, cellSize)
    }
  }

  renderBoard() {
    if (!this.cells) return
    const cells = this.cells
    for (const cell of cells) {
      const { i, j, val } = cell
      if (val) {
        this.renderCell(i, j, this.theme.colors[val])
      }
    }
  }

  renderGhost() {
    const hoveredCell = this.hoveredCell
    const ghost = this.ghost
    if (!ghost) return
    const {
      omino,
      position,
      valid,
    } = ghost
    if (!omino || !position) return
    const currentColor = this.currentColor
    const { i: di, j: dj } = position
    omino.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (!cell) return
        this.renderCell(i + di, j + dj, currentColor, {
          valid,
          ghost: true,
        })
      })
    })
  }

  render() {
    this.resize()
    this.renderGrid()
    this.renderBoard()
    this.renderGhost()
    this.renderGridLines()
  }

}

