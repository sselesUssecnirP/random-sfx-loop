
declare global {
    type FilePath = string & { __brand: "FilePath" }
    
    type changeConfig = (e: changeConfigOpts, isInput?: boolean) => void

    type API = {
        init: () => initReturn,
        dirExists: (dir: string) => boolean,
        setConfig: (config: config) => void,
        reload: (e: string) => void,
        isDev: () => any,
        choose: {
            binomial: Random.binomial,
            normal: Random.normal,
            uniformInt: Random.uniformInt,
            choice: Random.choice
        }
    }

    type config = {
        directory: string,
        configDir?: string,
        ignoredFolders: string[],
        ignoreUntagged: true | false,
        volume?: number,
        capQueue?: boolean,
        queueCap?: number,
        useBinomial?: boolean,
        binomialTrials?: number,
        binomialProb?: number,
        useDiscordBot: boolean,
        discord_token?: string,
        discord_client_id?: string
    }

    type baseId = 
        'toggleSFX' |
		'changeSFXCount' |
        'changeSFXCD' |
		'changeQueueTime' |
		'volumeSlider' |
		'settings' |
		'reloadApp' |
		'changeDir' |
		'ignoredFolders' |
		'ignoreUntagged' |
		'queueCap' |
        'capQueueEl' |
		'shouldDiscordBot' |
		'discordBotToken' |
		'discordBotClient' |
		'shouldBinomial' |
		'binomialTrials' |
		'binomialProb' |
        'minQueueTime'

    type loadElements = {
        id: baseId,
        hasLabel: boolean,
        type: 
        `button` |
        `input` |
        `div`
    }

    type elementMap = {
        button: HTMLButtonElement,
        input: HTMLInputElement,
        div: HTMLDivElement
    }

    type loadLabels = {
        id: `${baseId}Lab`,
        type: 'label'
    }

    type labelElementMap = {
        label: HTMLabelElement
    }

    type loadedDOMElements = {
		[K in baseId]: HTMLButtonElement | HTMLInputElement | HTMLDivElement;
    } & {
        [K in `${baseId}Lab`]: HTMLLabelElement
    }

    type strictDesctructure = {
		toggleSFX: HTMLButtonElement;
		changeSFXCount: HTMLInputElement;
        changeSFXCD: HTMLInputElement;
		changeQueueTime: HTMLInputElement;
		changeQueueTimeLab: HTMLLabelElement;
		volumeSlider: HTMLInputElement;
		settings: HTMLDivElement;
		reloadApp: HTMLButtonElement;
		changeDir: HTMLInputElement;
		changeDirLab: HTMLLabelElement;
		ignoredFolders: HTMLInputElement;
		ignoredFoldersLab: HTMLLabelElement;
		ignoreUntagged: HTMLInputElement;
		ignoreUntaggedLab: HTMLLabelElement;
		capQueueElLab: HTMLLabelElement;
        capQueueEl: HTMLInputElement;
		queueCap: HTMLInputElement;
		queueCapLab: HTMLLabelElement;
		shouldDiscordBot: HTMLInputElement;
		shouldDiscordBotLab: HTMLLabelElement;
		discordBotToken: HTMLInputElement;
		discordBotTokenLab: HTMLLabelElement;
		discordBotClient: HTMLInputElement;
		discordBotClientLab: HTMLLabelElement;
		shouldBinomial: HTMLInputElement;
		shouldBinomialLab: HTMLLabelElement;
		binomialTrials: HTMLInputElement;
		binomialTrialsLab: HTMLLabelElement;
		binomialProb: HTMLInputElement;
		binomialProbLab: HTMLLabelElement;
        minQueueTime: HTMLInputElement;
        minQueueTimeLab: HTMLLabelElement;
    }

    type loadedAudio = {
        loc: FilePath,
        tag?: 'song' | 'sfx',
        duration: number,
        src?: string,
        volume?: MediaElementAudioSourceNode
    }

    type getElement = (e: loadElements) => Array<string, HTMLElement, HTMLLabelElement>

    interface initReturn {
        audio: Array<loadedAudio>,
        config: config
    }

    interface Window {
        api: API
    }
}

export {}