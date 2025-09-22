
import { contextBridge, ipcRenderer } from 'electron';
import { readdirSync, writeFileSync, readFileSync, mkdirSync, existsSync, exists, Dirent } from 'fs';
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import { performance } from 'node:perf_hooks';
import path from 'path';

export type API = {
    init: () => initReturn,
    dirExists: (dir: string) => boolean,
    setConfig: (config: object) => void,
    reload: () => void
}

const configPath = path.join(process.env.LOCALAPPDATA as string, 'sselesUssecnirP', 'random-sfx');
const sfxTable = new AsciiTable3().setHeading('file');


const api: API = {
    init: () => {

        /*  CONFIG  */

        const defaultConfig = {
            directory: "",
            ignoredFolders: []
        };

        if (!existsSync(configPath)) {
            mkdirSync(configPath, { recursive: true });
            writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(defaultConfig, null, 2), { encoding: 'utf-8' });
        }

        let config = JSON.parse(readFileSync(path.join(configPath, 'config.json'), { encoding: 'utf-8'}));

        if (config.directory == "") {
            let defaultPath = path.join(process.env.USERPROFILE as string, "Music", "random-sfx");

            if (!existsSync(defaultPath)) {
                mkdirSync(defaultPath, { recursive: true });
            }

            config.directory = defaultPath;

            writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(config, null, 2), { encoding: 'utf-8' });
            console.log(`DEFAULT PATH: ${defaultPath}`);
        }

        /*  AUDIO FILES  */

        sfxTable.clearRows()

        const audio: string[] = [];

        let searchAudio = (baseDir: string) => {

            console.log(baseDir)

            readdirSync(baseDir, { withFileTypes: true}).forEach((dir: Dirent) => {
                
                if (dir.isFile()) {
                    if (['.mp3', '.ogg', '.wav'].some(e => dir.name.endsWith(e))) {
                        audio.push(path.join(baseDir, dir.name));
                        sfxTable.addRow(dir.name);
                    }
                } else if (dir.isDirectory() && !config.ignoredFolders.some((e: string) => path.join(baseDir, dir.name).includes(e))) {
                    searchAudio(path.join(baseDir, dir.name))
                }
            });
        };
        
        const t0 = performance.now()
        searchAudio(path.join(config.directory));
        const t1 = performance.now()
        console.log(`Found ${audio.length} files in ${(t1 - t0).toFixed(1)}ms`)


        console.log(`\n${sfxTable.toString()}`);
        console.log(audio.length)

        return { audio: audio, config: config };

    }, // End of init()
    dirExists: (dir) => existsSync(dir),
    setConfig: (config) => {
        writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(config, null, 2), { encoding: 'utf-8' });
    }, 
    reload: () => ipcRenderer.send('reload', 'main')


}

contextBridge.exposeInMainWorld('api', api);