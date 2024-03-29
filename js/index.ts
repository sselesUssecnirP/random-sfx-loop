// Calls upon Node.JS filesystem module to read directories synchronously
const { readdirSync } = require('fs');
const isTesting = false;
// Creates an empty audio object array
const audio: HTMLAudioElement[] = [];
// Determines the default value of sfx toggle state
let sfxEnabled = false;
// Determines the default value for asynschronous sfx methods
let runningMethods = 1;
// Determines the default value of sfx cooldown
// Common test value: 1000
let maxCooldown = 120000;
let dir: string;

if (isTesting) {
    dir = './sounds';
} else {
    dir = '../sounds'
}

// Reads the /sounds directory asynchrounously (1 file backwards from current directory)
readdirSync('./resources/app/sounds').forEach((file: string) => {
    // Each directory is it's own mp3 file, and gets added to a list
    audio.push(new Audio(`${dir}/${file}`))
});

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
            setTimeout(runSFX, Math.floor(Math.random() * maxCooldown))
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
        maxCooldown = objValue * 1000;
        return [`success`, `maxCooldown changed to ${objValue}`];
    } else {
        obj.value = '120';
        console.log(`Invalid response for SFX cooldown value`);
        return [`fail`, `maxCooldown defaulted to 120 seconds`];
    }
};

// Runs random sfx per random decimal times maxCooldown
const runSFX = async () => {
    if (!sfxEnabled) return;

    let num = Math.floor(Math.random() * audio.length);

    audio[num].play()

    console.log('played sound!')

    setTimeout(runSFX, Math.floor(Math.random() * maxCooldown))
}