
import { contextBridge, ipcRenderer } from 'electron/renderer';
import { readdirSync, writeFileSync, readFileSync, mkdirSync, existsSync, Dirent } from 'node:fs';
import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import path from 'node:path';


const configPath = path.join(process.env.LOCALAPPDATA as string, 'sselesUssecnirP', 'random-sfx');
const sfxTable = new AsciiTable3().setHeading('file');


const api: API = {
    init: () => {

        /*  CONFIG  */

        const defaultConfig: config = {
            directory: "",
            ignoredFolders: [],
            ignoreUntagged: false,
            volume: 75
        };

        if (!existsSync(configPath)) {
            mkdirSync(configPath, { recursive: true });
            writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(defaultConfig, null, 2), { encoding: 'utf-8' });
        }

        let config: config = JSON.parse(readFileSync(path.join(configPath, 'config.json'), { encoding: 'utf-8'}));

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

        const audio: Array<loadedAudio> = [];

        let searchAudio = (baseDir: string) => {

            console.log(baseDir)

            const isAudioTag = (x: unknown): x is loadedAudio['tag'] =>
                x === 'song' || x === 'sfx';

            readdirSync(baseDir, { withFileTypes: true}).forEach(async (dir: Dirent) => {

                if (dir.isFile()) {
                    if (['.mp3', '.ogg', '.wav'].some(e => dir.name.endsWith(e))) {
                        
                        let reg = /^\[(SONG|SFX)\]/i;
                        let audioTag: loadedAudio['tag'];
                        if (reg.test(dir.name)) {
                            let x = dir.name.match(reg)?.[1].toLowerCase();
                            if (isAudioTag(x)) {
                                audioTag = x;
                            } else {
                                audioTag = undefined;
                            }
                        }

                        let addAudio: loadedAudio = {
                            loc: path.join(baseDir, dir.name) as FilePath,
                            tag: audioTag,
                            duration: 0,
                            src: pathToFileURL(path.join(baseDir, dir.name)).href
                        }

                        if ((config.ignoreUntagged && addAudio.tag != undefined) || (config.ignoreUntagged === false)) {
                            audio.push(addAudio);
                            sfxTable.addRow(dir.name);
                        }
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
    dirExists: (dir) => existsSync(dir), // End of dirExists()
    setConfig: (config) => {
        writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(config, null, 2), { encoding: 'utf-8' });
    }, // End of setConfig()
    reload: (e: string) => ipcRenderer.send('reload', e),
    isDev: async () => { return await ipcRenderer.invoke('isDev') }


}

contextBridge.exposeInMainWorld('api', api);