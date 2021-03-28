import { Room } from 'colyseus'
import TicTacToeState from './TicTacToeState'

export default class TicTacToe extends Room<TicTacToeState>
{
  onCreate()
  {
    this.setState(new TicTacToeState())
  }
}