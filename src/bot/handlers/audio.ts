import fs from 'fs';
import { pathToFileURL } from 'url';
import { AsciiTable3 } from 'ascii-table3';
import { performance } from 'node:perf_hooks';
import path from 'path';
import { Event, ExtendedClient } from '../types/bot';
import { Dirent } from 'node:fs';

const sfxTable = new AsciiTable3().setHeading('file');

export default async (client: ExtendedClient) => {

const audio: Array<loadedAudio> = [];

    let searchAudio = (baseDir: string) => {

        console.log(baseDir)

        const isAudioTag = (x: unknown): x is loadedAudio['tag'] =>
            x === 'song' || x === 'sfx';

        fs.readdirSync(baseDir, { withFileTypes: true}).forEach(async (dir: Dirent) => {

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

                    if ((client.config.ignoreUntagged && addAudio.tag != undefined) || (client.config.ignoreUntagged === false)) {
                        audio.push(addAudio);
                        sfxTable.addRow(dir.name);
                    }
                }
            } else if (dir.isDirectory() && !client.config.ignoredFolders.some((e: string) => path.join(baseDir, dir.name).includes(e))) {
                searchAudio(path.join(baseDir, dir.name))
            }
        });
    };
    
    const t0 = performance.now()
    searchAudio(path.join(client.config.directory));
    const t1 = performance.now()
    
    console.log(`Found ${audio.length} files in ${(t1 - t0).toFixed(1)}ms`)


    console.log(`\n${sfxTable.toString()}`);
    console.log(audio.length)

    client.playerUtils.set('audio', audio)
        
}