import { ExtendedClient } from '../types/bot';
import { Events, Interaction, MessageFlags } from 'discord.js'

export default { 
    name: `ready`,
    description: `Runs when the bot is ready to serve`,
    manual: false,
    run: (client: ExtendedClient) => {

        client.on(Events.ClientReady, async readyClient => {
            console.log(`${readyClient.user.username} is logged in and ready!`);
        });
    }
}