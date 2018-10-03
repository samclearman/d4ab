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

export const ANGELA_THEME = {
  gridBackground: '#fafafa',
  gridLine: 'white',
  colors: [
    'white',
    '#6bd5e1',
    '#ffd98e',
    '#ffb677',
    '#ff8364',
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
    theme = DEFAULT_THEME,
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
    staged,
  }) {
    if (theme !== undefined) this.theme = theme
    if (cells !== undefined) this.cells = cells
    if (dimensions !== undefined) this.dimensions = dimensions
    if (ghost !== undefined) this.ghost = ghost
    if (currentColor !== undefined) this.currentColor = currentColor
  }

  getCellFor({ x, y }) {
    const cellSize = this.cellSize
    const rect = this.canvas.getBoundingClientRect()
    return {
      i: Math.floor((y - rect.top) / cellSize),
      j: Math.floor((x - rect.left) / cellSize),
    }
  }

  handleMouseExit = (e) => {
    this.emit('hovercell', null)
  }

  handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches.item(0)
    const { i, j } = this.getCellFor({
      x: touch.clientX,
      y: touch.clientY,
    })
    this.emit('touchstartcell', { i, j })
  }

  handleTouchMove = (e) => {
    if (e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches.item(0)
    const { i, j } = this.getCellFor({
      x: touch.clientX,
      y: touch.clientY,
    })
    this.emit('touchmovecell', { i, j })
  }

  handleTouchEnd = (e) => {
    this.emit('touchend')
  }

  handleClick = (e) => {
    const { i, j } = this.getCellFor({
      x: e.clientX,
      y: e.clientY,
    })
    this.emit('clickcell', { i, j })
  }

  handleMouseMove = (e) => {
    const { i, j } = this.getCellFor({
      x: e.clientX,
      y: e.clientY,
    })
    this.emit('hovercell', { i, j })
  }

  mount(container, canvas) {
    this.container = container
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('touchstart', this.handleTouchStart)
    this.canvas.addEventListener('touchmove', this.handleTouchMove)
    this.canvas.addEventListener('touchend', this.handleTouchEnd)
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

  renderCell(i, j, color, { ghost = false, valid = false, staged = false } = {} ) {
    const canvas = this.canvas,
          ctx = canvas.getContext('2d'),
          cellSize = this.cellSize
    const x = j * cellSize
    const y = i * cellSize
    if (ghost) {
      if (staged) {
        ctx.fillStyle = getHexStr8(color, 0.5)
        ctx.fillRect(x, y, cellSize, cellSize)
      } else {
        if (valid) {
          ctx.fillStyle = getHexStr8(color, 0.2)
          ctx.fillRect(x, y, cellSize, cellSize)
        } else {
          ctx.fillStyle = getHexStr8('black', 0.05)
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      }
    } else {
      ctx.fillStyle = getHexStr8(color, 1.0)
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
    const ghost = this.ghost
    if (!ghost) return
    const {
      omino,
      cell,
      valid,
      staged,
    } = ghost
    if (!omino || !cell) return
    const currentColor = this.currentColor
    const { i: di, j: dj } = cell

    omino.forEach((row, i) => {
      row.forEach((val, j) => {
        if (!val) return
        this.renderCell(i + di, j + dj, currentColor, {
          valid,
          staged,
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

