import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { ExtendedClient, ExtendedConfig } from './types/bot';

async function run(config: ExtendedConfig) {

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates
    ]}) as ExtendedClient;

    client.player = new Collection;
    client.subscription = new Collection;
    client.commands = new Collection;
    client.events = new Collection;
    client.windows = new Collection;
    client.config = config;
    client.playerUtils = new Collection;
    client.isPlaying = new Collection;
    client.isStopped = true;

    client.config.windows.forEach(e => {
        client.windows.set(e[0], e[1]);
    });

    const handlers = ["audio", "events", "commands"];

    try {
        for (const x of handlers) {
            const handler = await import(`./handlers/${x}.js`)
            await handler.default(client)
        }
    } catch (err) {
        console.error(err)
        return;
    }

    client.login(config.discord_token);
}

export default { run }