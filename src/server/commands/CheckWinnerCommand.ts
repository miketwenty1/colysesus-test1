import { Command } from '@colyseus/command'
import ITicTacToeState, { Cell } from '../../types/ITicTacToeState'
import NextTurnCommand from './NextTurnCommand'

type Payload = {

}

const getValueAt = (board: number[], row: number, col: number) => {
  const idx = (row * 3 + col)
  return board[idx]
}

const wins = [
  [{ row: 0, col: 0}, { row: 0, col: 1}, { row: 0, col: 2}], // rows
  [{ row: 1, col: 0}, { row: 1, col: 1}, { row: 1, col: 2}],
  [{ row: 2, col: 0}, { row: 2, col: 1}, { row: 2, col: 2}],
  [{ row: 0, col: 0}, { row: 1, col: 0}, { row: 2, col: 0}], // columns
  [{ row: 0, col: 1}, { row: 1, col: 1}, { row: 2, col: 1}],
  [{ row: 0, col: 2}, { row: 1, col: 2}, { row: 2, col: 2}],
  [{ row: 0, col: 0}, { row: 1, col: 1}, { row: 2, col: 2}], // diagonal
  [{ row: 2, col: 0}, { row: 1, col: 1}, { row: 0, col: 2}] // diagonal
]

export default class CheckWinnerCommand extends Command<ITicTacToeState, Payload>
{
  private determineWin()
  {
    for (let i = 0; i < wins.length; i++)
    {
      let hasWinner = true
      const win = wins[i]
      for (let j = 1; j < win.length; j++)
      {
        const prevCell = win[j - 1]
        const cell = win[j]

        const prevValue = getValueAt(this.state.board, prevCell.row, prevCell.col)
        const cellValue = getValueAt(this.state.board, cell.row, cell.col)

        if (prevValue !== cellValue || prevValue === Cell.Empty)
        {
          // no win
          hasWinner = false
          break
        }
      }
      if (hasWinner) {
        return win
      }
    }
    return false
  }
  execute()
  {
    const win = this.determineWin()
    if (win)
    {
      this.state.winningPlayer = this.state.activePlayer
    }
    else
    {
      return [
        new NextTurnCommand()
      ]
    }
  }
}