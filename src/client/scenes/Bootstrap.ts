import Phaser from 'phaser'
import Server from '../services/Server'

export default class Bootstrap extends Phaser.Scene
{
  // ! means in ts we will eventually set this to something
  private server!: Server

  constructor()
  {
    super('bootstrap')
  }

  init()
  {
    this.server = new Server()
  }
  create()
  {
    this.scene.launch('game', {
      server: this.server
    })
  }
}