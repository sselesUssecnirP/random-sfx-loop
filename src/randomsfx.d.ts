
declare global {
    type FilePath = string & { __brand: "FilePath" }

    type changeConfig = (e: 'directory' | 'ignoreFolders' | 'ignoreUntagged' | 'minQueueTime' | 'volume') => void

    type API = {
        init: () => initReturn,
        dirExists: (dir: string) => boolean,
        setConfig: (config: config) => void,
        reload: (e: string) => void,
        isDev: () => any
    }

    type config = {
        directory: string,
        ignoredFolders: string[],
        ignoreUntagged: true | false,
        volume?: number
    }

    type loadedAudio = {
        loc: FilePath,
        tag: 'song' | 'sfx' | undefined,
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