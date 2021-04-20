import { Schema, ArraySchema } from '@colyseus/schema'
export enum Cell
{
  Empty,
  X,
  O
}
export interface ITicTacToeState extends Schema
{
  board: ArraySchema<Cell>
  activePlayer: number
  winningPlayer: number
}

export default ITicTacToeState