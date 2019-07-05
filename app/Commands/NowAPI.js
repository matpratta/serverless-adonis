'use strict'

const fs = require('fs')

class NowAPI {
  static async getAuthToken() {
    // Check if we already have a token in place
    if (NowAPI.AUTH_TOKEN)
      return NowAPI.AUTH_TOKEN

    // The path to Now's CLI auth file. Normally ~/.now/auth.json
    const authFilePath = require('os').homedir() + '/.now/auth.json'

    // Check if file exists
    if (!fs.existsSync(authFilePath))
      return null

    // Extract the JSON
    const authInfo = JSON.parse(fs.readFileSync(authFilePath))

    // Cache the token

    // Return the token
    return authInfo.token || null
  }

  static getProjectFile () {
    return __dirname + '/../../now.json'
  }

  static getProject () {
    // The path to Now's now.json
    const projectFilePath = NowAPI.getProjectFile()

    // Check if file exists
    if (!fs.existsSync(projectFilePath))
      return null

    // Extract the JSON
    const projectInfo = JSON.parse(fs.readFileSync(projectFilePath))

    // Return the token
    return projectInfo || null
  }

  static updateProject (project) {
    // The path to Now's now.json
    const projectFilePath = NowAPI.getProjectFile()

    // Write the JSON
    fs.writeFileSync(projectFilePath, JSON.stringify(project, null, 2))
  }

  static async request (options) {
    // We will need axios for this
    const axios = require('axios')

    // Get an auth token
    const AUTH_TOKEN = await NowAPI.getAuthToken()

    // Validate token
    if (AUTH_TOKEN == null)
      throw 'No now-cli authentication found. Aborting...'

    // Prefix the API URL
    options.url = `https://api.zeit.co${options.url}`

    // Automatically append the auth token
    options = Object.assign(options, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    })

    // Returns request
    return await axios(options).then(response => response.data)
  }

  static envSet (name) {
    let project = NowAPI.getProject()
    project.env = project.env || {}

    if (name)
      return project.env[name]
    return project.env
  }
  static envSet (key, value) {
    let project = NowAPI.getProject()
    project.env = project.env || {}
    project.env[key] = value
    
    NowAPI.updateProject(project)
  }
  static envDel (key) {
    let project = NowAPI.getProject()
    project.env = project.env || {}
    delete project.env[key]
    
    NowAPI.updateProject(project)
  }

  static async secretGet (secret_name) {
    let secrets = (await NowAPI.request({
      method: 'GET',
      url: `/v2/now/secrets`
    })).secrets

    if (secret_name)
      return secrets.filter(secret => secret.name == secret_name)[0]
    return secrets
  }

  static async secretSet (secret_name, value) {
    // Check for existence first
    let secret = await NowAPI.secretGet(secret_name)

    // Delete if it already exists
    if (secret)
      await NowAPI.secretDel(secret_name)

    // Sets the secret
    return await NowAPI.request({
      method: 'POST',
      url: `/v2/now/secrets`,
      data: {
        name: secret_name,
        value: value
      }
    })
  }
  static async secretDel (secret_name) {
    return await NowAPI.request({
      method: 'DELETE',
      url: `/v2/now/secrets/${secret_name}`
    })
  }

  static async secretEnvSet (secret, value) {
    let project = NowAPI.getProject()
    let secretName = `${project.name}-${secret}`.toLowerCase()

    await NowAPI.secretSet(secretName, value)
    NowAPI.envSet(secret, `@${secretName}`)
  }
}

module.exports = NowAPI