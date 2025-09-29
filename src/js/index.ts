
const { audio, config } = window.api.init();

let sfxEnabled = false;
let runningMethods = 1;
let isTesting = window.api.isDev();
let maxRandomInterval = isTesting ? 1000 : 120000;
let minQueueSong = 60;
let shouldIgnoreUntagged = config.ignoreUntagged;

//let nowPlaying = document.getElementById('nowPlaying') as HTMLParagraphElement;

let toggleSFXB = document.getElementById('toggleSFX') as HTMLButtonElement;
let changeSFXCount = document.getElementById('changeSFXCount') as HTMLInputElement;
let changeSFXCD = document.getElementById('changeSFXCD') as HTMLInputElement;
let minQueueTime = document.getElementById('changeQueueTime') as HTMLInputElement;
//let minQueueTimeLab = document.getElementById('changeQueueTimeLab') as HTMLLabelElement;
let settings = document.getElementById('settings') as HTMLDivElement;
let directorySelector = document.getElementById('changeDir') as HTMLInputElement;
//let dirSelLabel = document.getElementById('changeDirLab') as HTMLLabelElement;
let ignoredFolders = document.getElementById('ignoredFolders') as HTMLInputElement;
//let ignoreFolLab = document.getElementById('ignoreFolLab') as HTMLLabelElement;
let ignoreUntagged = document.getElementById('ignoreUntagged') as HTMLInputElement;
//let ignoreUnLab = document.getElementById('ignoreUntaggedLab') as HTMLLabelElement;
 
settings.style.display = 'none';
changeSFXCount.value = `${runningMethods}`;
changeSFXCD.value = `${maxRandomInterval}`;
ignoreUntagged.checked = shouldIgnoreUntagged;
minQueueTime.value = `${minQueueSong}`;

const isPlaying: Array<loadedAudio> = [];
const queue: Array<loadedAudio> = [];


const sleep = async (ms: number = 1000) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


const openSettings = () => {
    console.log(settings.style.display)

    settings.style.display == 'none' ? settings.style.display = 'inline' : settings.style.display = 'none';
}

const changeConfig: changeConfig = (e) => {
        if (e === 'directory') {
            if (window.api.dirExists(directorySelector.value)) {

            console.log('changeDirectory value is good')

            directorySelector.style.backgroundColor = "#2bff00"
            config.directory = directorySelector.value;

            window.api.setConfig(config);

            window.api.reload('main')
        } else {

            console.log('changeDirectory value is bad')

            directorySelector.style.backgroundColor = "#ff0000"
        }
    } else if (e === 'ignoreFolders') {
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

        window.api.reload('main')
    } else if (e === 'ignoreUntagged') {
        config.ignoreUntagged = ignoreUntagged.checked;

        window.api.setConfig(config);

        window.api.reload('main')
    }
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


const changeSFXParams = (e: 'methodCount' | 'methodTime' | 'ignoreUntagged') => {
    if (e === 'methodCount') {
        let objValue = Number.parseInt(changeSFXCount.value);

        if (Number.isInteger(objValue)) {
            runningMethods = objValue;
            return [`success`, `method count changed to ${objValue}`];
        } else {
            changeSFXCount.value = '1';
            console.error(`Invalid response for SFX count value`);
            return [`success`, `method count defaulted to 1`];
        }
    } else if (e === 'methodTime') {
        let objValue = Number.parseInt(changeSFXCD.value);

        if (Number.isInteger(objValue)) {
            maxRandomInterval = objValue * 1000;
            return [`success`, `maxRandomInterval changed to ${objValue}`];
        } else {
            changeSFXCD.value = '120';
            console.error(`Invalid response for SFX cooldown value`);
            return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
        }
    } else if (e === 'ignoreUntagged') {

        if (typeof ignoreUntagged.checked === "boolean") {
            shouldIgnoreUntagged = ignoreUntagged.checked;

            changeConfig('ignoreUntagged');

            return [`success`, `stored ${ignoreUntagged.checked} boolean in shouldIgnoreUntagged: ${shouldIgnoreUntagged}`];
        } else {
            console.error(`${ignoreUntagged.checked} was not a boolean`);
            return [`fail`, `shouldIgnoreUntagged remained unchanged.`];
        }
    } else if (e === 'minQueueTime') {

        let objValue = Number.parseInt(minQueueTime.value);

        if (Number.isInteger(objValue)) {
            maxRandomInterval = objValue * 1000;
            return [`success`, `maxRandomInterval changed to ${objValue}`];
        } else {
            changeSFXCD.value = '120';
            console.error(`Invalid response for SFX cooldown value`);
            return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
        }
    }
}

const nextAudio = (sfx: HTMLAudioElement) => {

    let queueCheck = queue.shift();
    if (queueCheck?.loc) {
        isPlaying.push(queueCheck)
    } else {
        return;
    }

    const onEnded = () => {

            try { sfx.pause() } catch {}

            sfx.removeAttribute('src')
            sfx.load()
            
            nextAudio(new Audio(queue[0]?.loc));
    }

    sfx.onended = onEnded

    sfx.play()
    //nowPlaying.innerText = `${queueCheck.loc.split('/')[queueCheck.loc.split('/').length - 1]}`;

    console.log('played sound!');
}

const playAudio = () => {
    let sfx = new Audio(queue[0].loc);

    if (!shouldIgnoreUntagged) {
        nextAudio(sfx);
        return;
    }

    if (isPlaying.length == 0) {
        nextAudio(sfx);
    } else if (isPlaying.length > 0 && sfx.duration < minQueueSong) {
        nextAudio(sfx);
    }
}

const runSFX = async () => {

    if (!sfxEnabled) return;

    console.log(`Audio Length: ${audio.length - 1} / ${audio.length}`)

    let num = Math.floor(Math.random() * audio.length);

    queue.unshift(audio[num]);

    playAudio();

    setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval));
}