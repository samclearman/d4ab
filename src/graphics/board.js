const DEFAULT_THEME = {
  gridBackground: 'gray'
  gridLine: 'blue'
}


export default class Board {
  constructor() {
    this.rows = 10
    this.cols = 10
    this.theme = DEFAULT_THEME
  }

  get aspectRatio() {
    return this.cols / this.rows
  }

  mount(container, canvas) {
    this.container = container
    this.canvas = canvas
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
    ctx.fillStyle = this.theme.gridBackground
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.strokeStyle = this.theme.gridLine
    ctx.beginPath()
    const ctx = canvas.getContext('2d')
    for (let i = 1; i < this.rows; i += 1) {
      ctx.moveTo(0, i * cellHeight)
      ctx.lineTo(this.width, i * cellHeight)
    }
    for (let i = 0; i < this.rows; i += 1) {
      ctx.moveTo(i * cellWidth, 0)
      ctx.lineTo(i * cellWidth, this.height)
    }
    ctx.closePath()
    ctx.stroke()
  }

  render() {
    this.renderGrid()
  }

}

