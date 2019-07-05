'use strict'

const Env = use('Env')

const { Command } = require('@adonisjs/ace')
const NowAPI = require('./NowAPI')

class DeploymentPrepare extends Command {
  static get signature () {
    return `
      deployment:prepare
      `
  }

  static get description () {
    return 'Prepares your deployment into Now.sh'
  }

  async handle (args, options) {
    this.info('Now.sh deployment configuration wizard.')

    // Ensures the now.env file exists...
    this.info('Configuring ENV_PATH...')
    await this.ensureFile(__dirname + '/../../now.env')
    await NowAPI.envSet('ENV_PATH', 'now.env')

    // Copies current APP_KEY as a Now secret and env
    this.info('Configuring APP_KEY...')
    await NowAPI.secretEnvSet('APP_KEY', Env.get('APP_KEY'))

    // Finishes
    this.success('Deployment ready.')
  }
}

module.exports = DeploymentPrepare
