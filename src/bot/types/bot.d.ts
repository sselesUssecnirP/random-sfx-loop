import { Client, Collection, Interaction, SlashCommandBuilder } from 'discord.js';
import { APIApplicationCommand, Snowflake } from 'discord-api-types/v10'
import { AudioPlayer, PlayerSubscription } from '@discordjs/voice';

declare global {

}

export interface Command {
    data: SlashCommandBuilder;
    categories: Array<CommandCategory>;
    run: (interaction: Interaction) => Promise<any | void>;
    autocomplete?: (interaction: Interaction) => Promise<any | void>;
}

export interface CommandCategory {
    mainCategory: string,
    tags: Array<strings> | null
}

export interface Event {
    name: string;
    description?: string;
    manual?: boolean;
    run: (client: ExtendedClient) => Promise<any | void>;
}

export interface ExtendedClient extends Client {
    commands: Collection<string, Command>;
    events: Collection<string, Event>;
    windows: Collection<string, Number>;
    player: Collection<string, AudioPlayer>;
    config: ExtendedConfig;
    subscription: Collection<string, PlayerSubscription>;
    playerUtils: Collection<string, Array<loadedAudio>>;
    isPlaying: Collection<string, boolean>
    isStopped: boolean;
}

export interface ExtendedConfig extends config {
    windows: Array<[string, number]>;
    maxRandomInterval: number; // in seconds
}

export {}