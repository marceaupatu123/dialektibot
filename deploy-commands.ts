/* eslint-disable @typescript-eslint/no-floating-promises */
import { REST } from 'discord.js'
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const { clientId } = process.env
const guildId = process.env.localGuildId
const token = process.env.botToken

const commands: any = []

// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
commandFiles.forEach(file => {
  const command = require(`./src/commands/${file}`)
  commands.push(command.data.toJSON())
})

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '9' }).setToken(token!);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId!, guildId!),
      { body: commands }
    ) as string

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
