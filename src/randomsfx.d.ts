
declare global {
    type FilePath = string & { __brand: "FilePath" }
    
    type changeConfig = (e: changeConfigOpts) => void

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
        ignoredFolders: string[],
        ignoreUntagged: true | false,
        volume?: number,
        capQueue?: boolean,
        queueCap?: number
    }

    type loadedAudio = {
        loc: FilePath,
        tag?: 'song' | 'sfx',
        duration: number,
        src?: string,
        volume?: MediaElementAudioSourceNode
    }

    interface initReturn {
        audio: Array<loadedAudio>,
        config: config
    }

    interface Window {
        api: API
    }
}

export {}