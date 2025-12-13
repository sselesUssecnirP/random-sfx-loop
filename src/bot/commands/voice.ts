import { ChannelType, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../types/bot";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayer, getVoiceConnection } from "@discordjs/voice";
import random from "random";

export default {
    data: new SlashCommandBuilder()
            .setName('voice')
            .setDescription('Have the bot join/leave voice channel and manage playback')
            .addSubcommand(subcommand =>
                subcommand
                .setName('join')
                .setDescription('Join a voice channel to play sounds')
                .addChannelOption(option => 
                    option
                    .setName('channel')
                    .setDescription('The voice channel to join')
                    .addChannelTypes(ChannelType.GuildVoice)
                )
            )
            .addSubcommand(subcommand =>
                subcommand
                .setName('leave')
                .setDescription('Leave a voice channel to play sounds')
            )
            .addSubcommandGroup(group =>
                group
                .setName('playback')
                .setDescription('Manage playback of your random sound effects')
                .addSubcommand(subcommand => 
                    subcommand
                    .setName('play')
                    .setDescription('Start playback of random-sfx-loop')
                )
                .addSubcommand(subcommand => 
                    subcommand
                    .setName('pause')
                    .setDescription('Pause playback of random-sfx-loop')
                )
                .addSubcommand(subcommand => 
                    subcommand
                    .setName('interval')
                    .setDescription('Change the pause interval from 0 - {interval} milliseconds')
                    .addNumberOption(option => 
                        option
                        .setName('interval')
                        .setDescription(`{interval} in seconds for pauses between plays. (Default: 60)`)
                    )
                )
            ),
    categories: [],
    run: async (interaction: ChatInputCommandInteraction) => {

        if (!interaction.guild)
            return;

        let me = await interaction.guild.members.fetch(interaction.client.user.id)

        let group;
        if (interaction.options.getSubcommandGroup())
            group = interaction.options.getSubcommandGroup()
        else
            group = null
        let subcommand = interaction.options.getSubcommand()

        if (subcommand === 'join') {

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const me = await interaction.guild.members.fetch(interaction.client.user.id);

            if (me.voice.channel)
                return interaction.editReply({ content: `I am already in ${me.voice.channel}! Try having me leave first.` })

            if (!(interaction.client as ExtendedClient).player.has(interaction.guild.id))
                (interaction.client as ExtendedClient).player.set(interaction.guild.id, createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause
                    }
                }));

            const player = (interaction.client as ExtendedClient).player.get(interaction.guild.id)
            
            player?.on(AudioPlayerStatus.Idle, () => {

                if ((interaction.client as ExtendedClient).isStopped)
                    return;

                const file = random.choice((interaction.client as ExtendedClient).playerUtils.get('audio')!)
                setTimeout(() => player?.play(createAudioResource(file?.loc as string)), (interaction.client as ExtendedClient).config.maxRandomInterval * 1_000)
            });
            
            console.log(`created audio player`)

            const optChannel = interaction.options.getChannel('channel', true)
            if (!optChannel)
                return interaction.editReply({ content: `You didn't select a voice channel for me to join` });

            const channel = await interaction.guild.channels.fetch(optChannel.id)
            const connection = joinVoiceChannel({
                channelId: channel!.id,
                guildId: channel!.guild.id,
                adapterCreator: channel!.guild.voiceAdapterCreator,
            });

            connection.subscribe((interaction.client as ExtendedClient).player.get(interaction.guild.id)!);

            interaction.editReply({ content: `Joined ${channel}` })

        } else if (subcommand === 'leave') {

            await interaction.deferReply({ flags: MessageFlags.Ephemeral })

            const me = await interaction.guild.members.fetch(interaction.client.user.id);

            if (!me.voice.channel)
                return interaction.editReply({ content: `I am not in a voice channel right now` })
            
            let channelName = me.voice.channel.name

            const connection = getVoiceConnection(interaction.guild.id)!

            const sub = (interaction.client as ExtendedClient).subscription.has(interaction.guild.id) ? (interaction.client as ExtendedClient).subscription.get(interaction.guild.id) : null;

            if (sub)
                sub.unsubscribe()
            connection.disconnect()
            me.voice.disconnect('requested disconnected')
            connection.destroy()

            interaction.editReply({ content: `I have left the ${channelName} voice chat.` })

        } else if (group === 'playback') {

            if (!me.voice.channel)
                return interaction.reply({ content: `Please use ${'`/voice join`'} first!`, flags: MessageFlags.Ephemeral });

            if (subcommand === 'play') {

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                (interaction.client as ExtendedClient).isPlaying.set(interaction.guild.id, true);

                const player = (interaction.client as ExtendedClient).player.get(interaction.guild.id);
                if (!player)
                    return interaction.editReply({ content: `Either I am not in a voice channel or I'm having an out of body experience. Try using ${'`/voice join`'}` })

                if ((interaction.client as ExtendedClient).isStopped) {
                    
                    if (player.state.status === AudioPlayerStatus.Paused) {
                        player.unpause();
                        (interaction.client as ExtendedClient).isStopped = false;
                        return interaction.editReply({ content: `Your sounds were paused, so I unpaused them for you.` })
                    }
                }

                const file = random.choice((interaction.client as ExtendedClient).playerUtils.get('audio')!);

                setTimeout(() => player?.play(createAudioResource(file?.loc as string)), (interaction.client as ExtendedClient).config.maxRandomInterval * 1_000);

                (interaction.client as ExtendedClient).isStopped = false;

                interaction.editReply({ content: `Playing your random sound effects!` })
                

            } else if (subcommand === 'pause') {

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                const player = (interaction.client as ExtendedClient).player.get(interaction.guild.id)
                if (!player)
                    return interaction.editReply({ content: `Either I am not in a voice channel or I'm having an out of body experience. Try using ${'`/voice join`'}` })
                            
                if (player.state.status === AudioPlayerStatus.Playing) {
                    player.pause()
                }

                (interaction.client as ExtendedClient).isStopped = true;

                interaction.editReply({ content: `Playback has been paused!` })
                

            } else if (subcommand === 'interval') {

                await interaction.deferReply({ flags: MessageFlags.Ephemeral })

                let interval = interaction.options.getNumber('interval', true);

                (interaction.client as ExtendedClient).config.maxRandomInterval = interval

                interaction.editReply({ content: `Your new maxRandomInterval is ${interval * 1_000}ms` })
                
            }
        }
     }
}