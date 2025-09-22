

let sfxEnabled = false;
let runningMethods = 1;
let isTesting = true;
let maxRandomInterval = isTesting ? 1000 : 120000;

let toggleSFXB = document.getElementById('toggleSFX') as HTMLButtonElement;
let changeSFXCount = document.getElementById('changeSFXCount') as HTMLInputElement;
let changeSFXCD = document.getElementById('changeSFXCD') as HTMLInputElement;
let settings = document.getElementById('settings') as HTMLDivElement;
let directorySelector = document.getElementById('changeDir') as HTMLInputElement;
//let dirSelLabel = document.getElementById('changeDirLab') as HTMLLabelElement;
let ignoredFolders = document.getElementById('ignoredFolders') as HTMLInputElement;
//let ignoreFolLab = document.getElementById('ignoreFolLab') as HTMLLabelElement;
 
settings.style.display = 'none';
changeSFXCount.value = `${runningMethods}`;
changeSFXCD.value = `${maxRandomInterval}`;

const { audio, config } = window.api.init()

const openSettings = () => {
    console.log(settings.style.display)

    settings.style.display == 'none' ? settings.style.display = 'inline' : settings.style.display = 'none';
}

const changeDirectory = () => {
    if (window.api.dirExists(directorySelector.value)) {

        console.log('changeDirectory value is good')

        directorySelector.style.backgroundColor = "#2bff00"
        config.directory = directorySelector.value;

        window.api.setConfig(config);

        window.api.reload()
    } else {

        console.log('changeDirectory value is bad')

        directorySelector.style.backgroundColor = "#ff0000"
    }
}

const ignoreFolders = () => {
    const toIgnore: string[] = []
    try {
        toIgnore.push(...ignoredFolders.value.split(','));
    } catch {
        ignoredFolders.style.backgroundColor = "#ff0000"
        return;
    }

    ignoredFolders.style.backgroundColor = "#2bff00"
    config.ignoredFolders = toIgnore;

    window.api.setConfig(config);

    window.api.reload()
}

const toggleSFX = () => {

    if (sfxEnabled) {
        document.getElementById('toggleSFX')!.innerText = 'Start SFX';
        sfxEnabled = false;
        console.log('disabled!')
        return [`success`, `sfx has been disabled`]

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


const changeMethodCount = () => {
    let obj = document.getElementById('changeSFXCount')! as HTMLInputElement;
    let objValue = Number.parseInt(obj.value);

    if (Number.isInteger(objValue)) {
        runningMethods = objValue;
        return [`success`, `method count changed to ${objValue}`];
    } else {
        obj.value = '1';
        console.error(`Invalid response for SFX count value`);
        return [`success`, `method count defaulted to 1`];
    }
};


const changeMethodTime = () => {
    let obj = document.getElementById('changeSFXCD') as HTMLInputElement;
    let objValue = Number.parseInt(obj.value);

    if (Number.isInteger(objValue)) {
        maxRandomInterval = objValue * 1000;
        return [`success`, `maxRandomInterval changed to ${objValue}`];
    } else {
        obj.value = '120';
        console.error(`Invalid response for SFX cooldown value`);
        return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
    }
};


const runSFX = async () => {
    if (!sfxEnabled) return;

    console.log(`Audio Length: ${audio.length - 1} / ${audio.length}`)

    let num = Math.floor(Math.random() * audio.length);

    let sfx = new Audio(audio[num])

    const onEnded = () => {

        try { sfx.pause() } catch {}

        sfx.removeAttribute('src')
        sfx.load()
    }

    sfx.onended = onEnded

    sfx.play()

    console.log('played sound!');

    setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval));
}