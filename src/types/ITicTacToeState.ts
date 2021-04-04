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
}

export default ITicTacToeState