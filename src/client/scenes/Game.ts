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
    console.log('hello3')
    let x = 100
    let y = 100
    state.board.forEach((cellState, idx) => {
      this.add.rectangle(x, y, 64, 64, 0xffffff)
      x += 64 + 5

      if (idx % 3 === 0)
      {
        y += 64 + 5
        x = 100
      }
    })
  }

}