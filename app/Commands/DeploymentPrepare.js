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

    // Checks if project file exists
    let projectExists = await this.pathExists(NowAPI.getProjectFile())
    
    // If not, setup.
    if (!projectExists) {
      // Creates a standard project base for Now v2
      let project = {
        version: 2,
        builds: [{
          src: 'server.js',
          use: '@now/node-server',
          config: {
            includeFiles: ['**'],
            maxLambdaSize: '50mb'
          }
        }],
        routes: [{
          src: '/(.*)',
          dest: '/server.js'
        }]
      }

      // Sets project up
      this.info('Setting up Now.sh project...')
      project.name = await this.ask('Enter Now.sh project name:', Env.get('APP_NAME'))

      // Configures alias
      let setupAlias = await this.confirm('Do you want to customize your project alias?')
      if (setupAlias) {
        project.alias = await this.ask('Enter Now.sh project alias:', project.name)
      }

      // Saves
      await NowAPI.updateProject(project)
    }

    // Setting up environment...
    this.info('Configuring environment...')
    await NowAPI.envSet('HOST', '127.0.0.1')
    await NowAPI.envSet('PORT', '3333')
    await NowAPI.envSet('NODE_ENV', 'production')

    // Ensures the now.env file exists, just a dummy file because all env variables should come from the deployment...
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
