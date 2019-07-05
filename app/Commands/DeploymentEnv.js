'use strict'

const { Command } = require('@adonisjs/ace')
const NowAPI = require('./NowAPI')

class DeploymentEnv extends Command {
  static get signature () {
    return `
      deployment:env
      { name? : Name of the environment variable }
      { value? : New value of the environment variable }
      `
  }

  static get description () {
    return 'Retrieves or sets an environment variable'
  }

  async nowAuthToken () {
    // The path to Now's CLI auth file. Normally ~/.now/auth.json
    const authFilePath = require('os').homedir() + '/.now/auth.json'
    
    // Check if file exists
    if (!(await this.pathExists(authFilePath)))
      return null

    // Extract the JSON
    const authInfo = JSON.parse(await this.readFile(authFilePath))

    // Return the token
    return authInfo.token || null
  }

  nowProjectFile () {
    return __dirname + '/../../now.json'
  }

  async nowProject () {
    // The path to Now's CLI auth file. Normally ~/.now/auth.json
    const projectFilePath = this.nowProjectFile()
    
    // Check if file exists
    if (!(await this.pathExists(projectFilePath)))
      return null

    // Extract the JSON
    const projectInfo = JSON.parse(await this.readFile(projectFilePath))

    // Return the token
    return projectInfo || null
  }

  async nowRequest (options) {
    // We will need axios for this
    const axios = require('axios')

    // Prefix the API URL
    options.url = `https://api.zeit.co${options.url}`

    // Automatically append the auth token
    options = Object.assign(options, {
      headers: {
        Authorization: `Bearer ${this.NOW_TOKEN}`
      }
    })

    console.log(options)

    // Returns request
    return await axios(options).then(response => response.data)
  }

  async handle (args, options) {
    // Loads Now project meta and auth
    const nowProject = await this.nowProject()
    const nowToken = await this.nowAuthToken()

    // Checks for project
    if (nowProject == null)
      return this.error('No now.json found. Aborting...')

    // Checks for auth
    if (nowToken == null)
      return this.error('No now-cli authentication found. Aborting...')

    // Sets the token
    this.NOW_TOKEN = nowToken

    // Gets project info
    const nowProjectInfo = await this.nowRequest({
      method: 'GET',
      url: `/v1/projects/${nowProject.name}`
    })

    if (!args.value) {
      // If we have no second argument (value set), obtain all variables
      const nowProjectEnv = nowProject.env || {}

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

module.exports = DeploymentEnv
