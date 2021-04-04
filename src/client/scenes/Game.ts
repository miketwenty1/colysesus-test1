import Phaser from 'phaser'
import ITicTacToeState, { Cell } from '../../types/ITicTacToeState'
import type Server from '../services/Server'

export default class Game extends Phaser.Scene
{
  private server?: Server
  private cells: { display: Phaser.GameObjects.Rectangle, value: Cell }[] = []
  constructor()
  {
    super('game')
  }

  async create(data: { server: Server })
  {
    const { server } = data
    this.server = server
    if (!this.server)
    {
      throw new Error('server instance missing')
    }
    await this.server.join()
    // server.onceStateChanged(state => {
    //   console.log(state)
    // })
    this.server.onceStateChanged(this.createBoard, this)
    // this.server.onceStateChanged(this.handleBoardChanged, this)
  }

  private createBoard(state: ITicTacToeState)
  {
    const { width, height } = this.scale
    const size = 128
    const borderSize = 3
    let x = (width * 0.5) - size
    let y = (height * 0.5) - size

    state.board.forEach((cellState, idx) => {
      const cell = this.add.rectangle(x, y, size, size, 0xffffff)
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          // call makeSelection unless it's undefined then don't
          this.server?.makeSelection(idx)
        })
      this.cells.push({
        display: cell,
        value: cellState
      })
      x += size + borderSize

      if ((idx + 1) % 3 === 0)
      {
        y += size + borderSize
        x = (width * 0.5) - size
      }
    })
    this.server?.onBoardChanged(this.handleBoardChanged, this)
  }
  private handleBoardChanged(newValue: Cell, idx: number)
  {
    const cell = this.cells[idx]
    if (cell.value !== newValue)
    {
      this.add.star(cell.display.x, cell.display.y, 4, 4, 60, 0x7f2dff)
        .setAngle(45)
      // cell.value = board[idx]
    }
    cell.value = newValue
  }
}