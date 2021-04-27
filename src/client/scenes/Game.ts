import Phaser from 'phaser'
import { IGameOverSceneData, IGameSceneData } from '../../types/scenes'
import ITicTacToeState, { Cell, GameState} from '../../types/ITicTacToeState'
import type Server from '../services/Server'

export default class Game extends Phaser.Scene
{
  private server?: Server
  private onGameOver?: (data: IGameOverSceneData) => void
  private gameStateText?: Phaser.GameObjects.Text
  private gamePlayerTurnText?: Phaser.GameObjects.Text
  private cells: { display: Phaser.GameObjects.Rectangle, value: Cell }[] = []
  constructor()
  {
    super('game')
  }

  init()
  {
    this.cells = []
  }
  async create(data: IGameSceneData)
  {
    const { server, onGameOver } = data
    this.server = server
    this.onGameOver = onGameOver
    if (!this.server)
    {
      throw new Error('server instance missing')
    }
    await this.server.join()
    // server.onceStateChanged(state => {
    //   console.log(state)
    // })
    this.server.onceStateChanged(this.createBoard, this)
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
      // to help show correct state if you join the room while it's already in progress somehow like a browser refresh
      switch (cellState)
      {
        case Cell.X:
          {
            this.add.star(cell.x, cell.y, 4, 4, 60, 0x7f2dff)
              .setAngle(45)
            break
          }
        case Cell.O:
          {
            this.add.circle(cell.x, cell.y, 48, 0xff022)
            this.add.circle(cell.x, cell.y, 44, 0xffffff)
            break
          }
      }

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

    if (this.server?.gameState === GameState.WaitingForPlayers)
    {
      const width = this.scale.width
      this.gameStateText = this.add.text(width * 0.5, 50, 'Waiting for opponent...')
        .setOrigin(0.5)
      this.gamePlayerTurnText = undefined
    }
    if (this.gamePlayerTurnText === undefined && this.server?.gameState !== GameState.WaitingForPlayers)
    {
      // if (this.server?.playerIndex === playerIndex)
      // {
      //   this.gamePlayerTurnText = this.add.text(width * 0.5, 50, 'Your Turn')
      //     .setOrigin(0.5)
      // }
      // else
      // {
      //   this.gamePlayerTurnText = this.add.text(width * 0.5, 50, 'Your Opponent\'s Turn')
      //     .setOrigin(0.5)
      // }
    }

    this.server?.onBoardChanged(this.handleBoardChanged, this)
    this.server?.onPlayerTurnChanged(this.handlePlayerTurnChanged, this)
    this.server?.onPlayerWon(this.handlePlayerWon, this)
    this.server?.onGameStateChanged(this.handleGameStateChanged, this)
  }
  private handleBoardChanged(newValue: Cell, idx: number)
  {
    const cell = this.cells[idx]
    if (cell.value !== newValue)
    {
      switch (newValue)
      {
        case Cell.X:
          {
            this.add.star(cell.display.x, cell.display.y, 4, 4, 60, 0x7f2dff)
              .setAngle(45)
            break
          }
        case Cell.O:
          {
            this.add.circle(cell.display.x, cell.display.y, 48, 0xff022)
            this.add.circle(cell.display.x, cell.display.y, 44, 0xffffff)
            break
          }
      }
    }
    cell.value = newValue
  }

  private handlePlayerTurnChanged(playerIndex: number)
  {
    console.log(this.server?.playerIndex)
    this.gamePlayerTurnText?.destroy()
    const width = this.scale.width
    if (this.server?.playerIndex === playerIndex)
    {
      this.gamePlayerTurnText = this.add.text(width * 0.5, 50, 'Your Turn')
        .setOrigin(0.5)
    }
    else
    {
      this.gamePlayerTurnText = this.add.text(width * 0.5, 50, 'Your Opponent\'s Turn')
        .setOrigin(0.5)
    }
  }

  private handlePlayerWon(playerIndex: number)
  {
    this.time.delayedCall(600, () => {
      if (!this.onGameOver)
      {
        return
      }
      this.onGameOver({
        winner: this.server?.playerIndex === playerIndex
      })
    })
  }
  private handleGameStateChanged(state: GameState)
  {
    if (state === GameState.Playing && this.gameStateText)
    {
      this.gameStateText.destroy()
      this.gameStateText = undefined
    }
  }
}