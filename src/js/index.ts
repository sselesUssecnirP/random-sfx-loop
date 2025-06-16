// Calls upon Node.JS filesystem module to read directories synchronously

const { readdirSync, writeFileSync, readFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');
const ascii = require('ascii-table');
// Creates an empty audio object array
const audio: HTMLAudioElement[] = [];
// Determines the default value of sfx toggle state
let sfxEnabled = false;
// Determines the default value for asynschronous sfx methods
let runningMethods = 1;
// Determines the default value of sfx cooldown
// Common test value: 1000
let maxRandomInterval = 120000;
let configPath = path.join(process.env.LOCALAPPDATA, 'sselesUssecnirP', 'random-sfx')
let defaultConfig = {
    directory: ""
}

if (!existsSync(configPath)) {
    mkdirSync(configPath, { recursive: true })
    writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(defaultConfig, null, 2))
} 

let config = require(path.join(configPath, 'config.json'));
if (config.directory == "") {
    /*
    let obj = document.getElementById('setup')! as HTMLDivElement;
    obj.hidden = false;
    obj.style.minWidth = '50vw';
    obj.style.minHeight = '50vh';
    */
    let defaultPath = path.join(process.env.USERPROFILE, "Music", "random-sfx");

    if (!existsSync(defaultPath)) {
        mkdirSync(defaultPath, { recursive: true })
    }

    config.directory = defaultPath;
    writeFileSync(path.join(configPath, 'config.json'), JSON.stringify(config, null, 2))
    console.log(`DEFAULT PATH: ${defaultPath}`)
}
/*
const selectSoundDir = () => {
    let obj = document.getElementById('changeSoundDir')! as HTMLInputElement;
    let div = document.getElementById('setup')! as HTMLDivElement;
    
    if (!existsSync(obj.value)) return ['fail', 'invalid file path']

    div.hidden = true;
    config.directory = obj.value
    writeFileSync('./config.json', JSON.stringify(config, null, 2));
    // app.quit
}
*/

const sfxTable = new ascii().setHeading('file')

// Reads the /sounds directory asynchrounously (1 file backwards from current directory)
readdirSync(path.join(config.directory)).forEach((file: string) => {
    // Each directory is it's own mp3 file, and gets added to a list

    if (['.mp3', '.ogg', '.wav'].some((e) => file.endsWith(e))) {
        audio.push(new Audio(`${path.join(config.directory, file)}`));
        sfxTable.addRow(file)
    } else if (file.endsWith('.txt')) {
        readFileSync(`${path.join(config.directory, file)}`, 'ascii').split(/\r?\n/).forEach((e: string) => {
            if (e.trim()) {
                audio.push(new Audio(e));
                sfxTable.addRow(e)
            }
        })
    }
});

console.log(sfxTable.toString())

// A function to be called from the button which modifies the sfx toggle state
const toggleSFX = () => {
    // if sfx is enabled, it disables it
    if (sfxEnabled) {
        document.getElementById('toggleSFX')!.innerText = 'Start SFX';
        sfxEnabled = false;
        console.log('disabled!')
        return [`success`, `sfx has been disabled`]
    // if sfx is disabled, it enables it and runs the requested processes
    } else {
        document.getElementById('toggleSFX')!.innerText = 'Stop SFX';
        sfxEnabled = true;
        for (let i = 0; i < runningMethods; i++) {
            console.log('ran SFX')
            setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval))
        }
        console.log('enabled!');
        return [`success`, `sfx has been enabled`]
    }
};

// Modifies the number of sfx processes that run
const changeMethodCount = () => {
    let obj = document.getElementById('changeSFXCount')! as HTMLInputElement;
    let objValue = Number.parseInt(obj.value);

    if (Number.isInteger(objValue)) {
        runningMethods = objValue;
        return [`success`, `method count changed to ${objValue}`];
    } else {
        obj.value = '1';
        console.log(`Invalid response for SFX count value`);
        return [`success`, `method count defaulted to 1`];
    }
};

// Modifies the number of sfx processes that run
const changeMethodTime = () => {
    let obj = document.getElementById('changeSFXCD') as HTMLInputElement;
    let objValue = Number.parseInt(obj.value);

    if (Number.isInteger(objValue)) {
        maxRandomInterval = objValue * 1000;
        return [`success`, `maxRandomInterval changed to ${objValue}`];
    } else {
        obj.value = '120';
        console.log(`Invalid response for SFX cooldown value`);
        return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
    }
};

// Runs random sfx per random decimal times maxRandomInterval
const runSFX = async () => {
    if (!sfxEnabled) return;

    console.log(`Audio Length: ${audio.length - 1} / ${audio.length}`)

    let num = Math.floor(Math.random() * audio.length);

    audio[num].play();

    console.log('played sound!');

    setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval));
}