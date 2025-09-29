
declare global {
    type FilePath = string & { __brand: "FilePath" }

    type changeConfig = (e: 'directory' | 'ignoreFolders' | 'ignoreUntagged') => void

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
        ignoreUntagged: true | false
    }

    type loadedAudio = {
        loc: FilePath,
        tag: 'song' | 'sfx' | undefined;
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