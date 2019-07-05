'use strict'

class NowAPI {
  static async getAuthToken() {
    // Check if we already have a token in place
    if (NowAPI.AUTH_TOKEN)
      return NowAPI.AUTH_TOKEN

    // The path to Now's CLI auth file. Normally ~/.now/auth.json
    const authFilePath = require('os').homedir() + '/.now/auth.json'

    // Check if file exists
    if (!(await NowAPI.pathExists(authFilePath)))
      return null

    // Extract the JSON
    const authInfo = JSON.parse(await NowAPI.readFile(authFilePath))

    // Cache the token

    // Return the token
    return authInfo.token || null
  }

  static getProjectFile () {
    return __dirname + '/../../now.json'
  }

  static async getProject () {
    // The path to Now's CLI auth file. Normally ~/.now/auth.json
    const projectFilePath = NowAPI.getProjectFile()

    // Check if file exists
    if (!(await NowAPI.pathExists(projectFilePath)))
      return null

    // Extract the JSON
    const projectInfo = JSON.parse(await NowAPI.readFile(projectFilePath))

    // Return the token
    return projectInfo || null
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

    console.log(options)

    // Returns request
    return await axios(options).then(response => response.data)
  }
}

module.exports = NowAPI