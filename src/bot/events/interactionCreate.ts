import { ExtendedClient } from '../types/bot';
import { Events, Interaction, MessageFlags } from 'discord.js'

export default { 
    name: `interactionCreate`,
    description: `Handles running responses to interactions with the bot`,
    manual: false,
    run: (client: ExtendedClient) => {

        client.on(Events.InteractionCreate, async (interaction: Interaction) => {

            if (interaction.isChatInputCommand()) {

                const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                try {
                    await command.run(interaction);
                } catch (error) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                        content: `There was an error while executing this command! (followUp)`,
                        flags: MessageFlags.Ephemeral
                    });
                    } else {
                        await interaction.reply({
                            content: `There was an error while executing command! (reply)`,
                            flags: MessageFlags.Ephemeral
                        })
                    }
                }
            }

        });
    }
}