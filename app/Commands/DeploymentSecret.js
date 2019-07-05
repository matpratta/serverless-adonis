'use strict'

const { Command } = require('@adonisjs/ace')
const NowAPI = require('./NowAPI')

class DeploymentSecret extends Command {
  static get signature () {
    return `
      deployment:secret
      { name? : Name of the secret }
      { value? : New value of the secret }
      `
  }

  static get description () {
    return 'Retrieves or sets an environment variable'
  }

  async handle (args, options) {
    // Loads Now project meta and auth
    const nowProject = await NowAPI.nowProject()

    // Checks for project
    if (nowProject == null)
      return this.error('No now.json found. Aborting...')

    // Gets project info
    const nowProjectInfo = await this.nowRequest({
      method: 'GET',
      url: `/v1/projects/${nowProject.name}`
    })

    if (!args.value) {
      // If we have no second argument (value set), obtain all variables
      const nowSecrets = NowAPI.request({
        url: `/v2/now/secrets/`
      })

      // Check if the user specified an variable name
      if (args.name) {
        let matchEnv = nowProjectEnv[args.name]

        if (matchEnv)
          this.info(`${args.name}=${matchEnv}`)
        else
          this.warn(`Environment variable "${args.name}" not found.`)
      } else {
        let tableEnv = nowProjectEnv

        this.info('Listing environment variables...')
        this.table(['Key', 'Value'], tableEnv)
      }
    } else if (args.name == '--delete') {
      nowProject.env = 

      // If we have second argument (value set) but with first argument beinbg --delete, we delete an env var
      await this.nowRequest({
        method: 'DELETE',
        url: `/v2/now/secrets/${args.value.id}`
      })

      this.info(`Environment variable "${args.name}" deleted successfully.`)
    } else {
      // If we have second argument (value set), we set a env var
      await this.nowRequest({
        method: 'POST',
        url: `/v2/now/secrets`,
        data: {
          key: args.name,
          value: args.value
        }
      })

      this.info(`Environment variable "${args.name}" updated successfully.`)
    }
  }
}

module.exports = DeploymentSecret