
import type { API } from './preload'

declare global {

    interface initReturn {
        audio: string[],
        config: config
    }

    interface Window {
        api: API
    }
}

export {}