import Phaser from 'phaser'
// import type { Server } from '../services/Server'

export default class Game extends Phaser.Scene
{
  constructor()
  {
    super('game')
  }

  create(data: { server: any })
  {
    const { server } = data
    server.join()
  }
}