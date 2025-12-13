import { APIApplicationCommand, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js'
import type { Command, ExtendedClient } from '../types/bot';
import fs from 'fs';
import path from 'path';

export default async (client: ExtendedClient) => {
    
    const commandsFolder = path.join(__dirname, '..', 'commands');
    const queue: Array<string> = [commandsFolder]
    const commands: Array<RESTPostAPIApplicationCommandsJSONBody> = [];

    while (queue.length > 0) {
        const currentDir = queue.shift()!
        const entries = fs.readdirSync(currentDir)

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry);
            const info = fs.statSync(fullPath);

            if (info.isDirectory()) {

                queue.push(fullPath);

            } else if (info.isFile()) {

                if (!fullPath.endsWith('.js'))
                    continue;

                const exported = await import(fullPath);
                const command = exported.default as Command;

                const rel = path.relative(commandsFolder, fullPath)
                const parts = rel.split(path.sep)
                const fileName = parts.at(-1)?.replace(/\.[^.]+$/, "")

                const folders = parts.slice(0, -1);

                const mainCategory = folders[0] ?? `uncategorized`;
                const tags = mainCategory !== `uncategorized` ? folders.slice(1) : null
                
                command.categories.push({ mainCategory: mainCategory, tags: tags })

                if ('data' in command && 'run' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON())
                } else {
                    console.log(`[WARNING] The command at ${fullPath} has malformed data.`)
                }

            }
        }
    }

    const rest = new REST().setToken(client.config.discord_token!);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`)
            
            const data = await rest.put(Routes.applicationCommands(client.config.discord_client_id!), { body: commands }) as Array<APIApplicationCommand>;

            console.log(`Successfully reloaded ${data.length} application (/) commands.`)
        } catch (error) {

            console.error(error)
        }
    })();
};