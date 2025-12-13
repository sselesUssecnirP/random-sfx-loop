import { AudioPlayer, getVoiceConnection } from '@discordjs/voice';
import { ExtendedClient } from '../types/bot';
import { Events } from 'discord.js'

export default { 
    name: `voiceStateUpdate`,
    description: `Runs when the bot connects to a voice channel`,
    manual: false,
    run: (client: ExtendedClient) => {

        client.on(Events.VoiceStateUpdate, async (oldState, voiceState) => {
            
            console.log(`Voice Channel: ${oldState.channel} | ${voiceState.channel}\nMember Display Name: ${oldState.member?.displayName} | ${voiceState.member?.displayName}`)

            let isClientState = true;
            if (voiceState.member?.id !== (voiceState.client as ExtendedClient).user!.id)
                isClientState = false;

            if (!isClientState) {
                const me = await voiceState.guild.members.fetch(voiceState.client.user.id);

                if (!me.voice.channel)
                    return;

                if (!(me.voice.channelId === oldState.channelId))
                    return;

                const memberCountBool = voiceState.channel?.members.size == 1 || oldState.channel?.members.size == 1
                const isClient = voiceState.channel?.members.has(me.id) || oldState.channel?.members.has(me.id)

                
                if (memberCountBool && isClient) {

                    const removeConnection = () => {

                        const connection = getVoiceConnection(voiceState.guild.id)!

                        let player: AudioPlayer | null = null;
                        if ((voiceState.client as ExtendedClient).player.has(voiceState.guild.id))
                            player = (voiceState.client as ExtendedClient).player.get(voiceState.guild.id)!
                        const sub = client.subscription.has(voiceState.guild.id) ? client.subscription.get(voiceState.guild.id) : null;

                        return () => {

                            if (voiceState.channel?.members.size! > 1)
                                return;

                            if (sub)
                                sub?.unsubscribe()
                            connection.disconnect()
                            me.voice.disconnect('')
                            connection.destroy()
                        }
                    }
                    
                    setTimeout((removeConnection)(), 120_000)
                }
            }

        });
    }
}