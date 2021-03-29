import Phaser from 'phaser'
import ITicTacToeState from '../../types/ITicTacToeState'
import type Server from '../services/Server'

export default class Game extends Phaser.Scene
{
  constructor()
  {
    super('game')
  }

  async create(data: { server: Server })
  {
    const { server } = data
    await server.join()
    // server.onceStateChanged(state => {
    //   console.log(state)
    // })
    server.onceStateChanged(this.createBoard, this)
  }

  private createBoard(state: ITicTacToeState)
  {
    const { width, height } = this.scale
    const size = 128
    const borderSize = 3
    let x = (width * 0.5) - size
    let y = (height * 0.5) - size

    state.board.forEach((cellState, idx) => {
      this.add.rectangle(x, y, size, size, 0xffffff)
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {

        })
      x += size + borderSize

      if ((idx + 1) % 3 === 0)
      {
        y += size + borderSize
        x = (width * 0.5) - size
      }
    })
  }

}