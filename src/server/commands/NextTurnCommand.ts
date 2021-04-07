import { Command } from '@colyseus/command'
import ITicTacToeState from '../../types/ITicTacToeState';

type Payload = {

}
export default class NextTurnCommand extends Command<ITicTacToeState>
{
  execute()
  {
    const activePlayer = this.room.state.activePlayer
    if (activePlayer === 0)
    {
      this.room.state.activePlayer = 1
    }
    else
    {
      this.room.state.activePlayer = 0
    }
  }

}