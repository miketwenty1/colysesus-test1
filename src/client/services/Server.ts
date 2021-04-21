import { Client, Room } from 'colyseus.js'
import Phaser from 'phaser'
import {ITicTacToeState} from '../../types/ITicTacToeState'
import { GameState } from '../../types/ITicTacToeState'
import { Message } from '../../types/messages'

export default class Server
{
  private client: Client
  private events: Phaser.Events.EventEmitter

  private room?: Room<ITicTacToeState>
  private _playerIndex = -1

  get playerIndex()
  {
    return this._playerIndex
  }
  constructor()
  {
    this.client = new Client('ws://localhost:2567')
    this.events = new Phaser.Events.EventEmitter()
  }

  async join()
  {
    this.room = await this.client.joinOrCreate<ITicTacToeState>('tic-tac-toe')

    this.room.onMessage(Message.PlayerIndex, (message: { playerIndex: number }) => {
      this._playerIndex = message.playerIndex
    })

    // this.room.onMessage('*', (type, message) => {
    //   switch (type)
    //   {
    //     case Message.PlayerIndex:
    //       this._playerIndex = message.playerIndex
    //       break
    //   }
    // })

    this.room.onStateChange.once(state => {
      this.events.emit('once-state-changed', state)
    })

    this.room.state.onChange = (changes) => {
      changes.forEach(change => {
        const { field, value } = change
        switch (field)
        {
          case 'board':
            // this.events.emit('board-change')
            break
          case 'activePlayer':
              this.events.emit('player-turn-changed', value)
            break

          case 'winningPlayer':
            this.events.emit('player-won', value)
            break
          case 'gameState':
            this.events.emit('game-state-changed', value)
            break
        }
      })
    }
    this.room.state.board.onChange = (item, idx) => {
      this.events.emit('board-changed', item, idx)
    }
  }

  leave()
  {
    this.room?.leave()
    this.events.removeAllListeners()
  }

  makeSelection(idx: number)
  {
    if (!this.room)
    {
      return
    }
    if (this._playerIndex !== this.room.state.activePlayer)
    {
      console.warn('not this player\'s turn')
      return
    }
    this.room.send(Message.PlayerSelection, { index: idx})
  }
  onceStateChanged(cb: (state: ITicTacToeState) => void, context?: any)
  {
    this.events.once('once-state-changed', cb, context)
  }

  onBoardChanged(cb: (cell: number, index: number) => void, context?: any)
  {
    this.events.on('board-changed', cb, context)
  }

  onPlayerTurnChanged(cb: (playerIndex: number) => void, context?: any)
  {
    this.events.on('player-turn-changed', cb, context)
  }

  onPlayerWon(cb: (playerIndex: number) => void, context?: any)
  {
    this.events.on('player-won', cb, context)

    return () => {
      this.events.off('player-won', cb, context)
    }
  }
  onGameStateChanged(cb: (state: GameState) => void, context?: any)
  {
    this.events.on('game-state-changed', cb, context)
  }
}
