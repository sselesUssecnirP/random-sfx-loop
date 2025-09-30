
enum changeConfigOpts {
    Directory = 'directory',
    IgnoreFolders = 'ignoreFolders',
    IgnoreUntagged = 'ignoredUntagged',
    MinQueueTime = 'minQueueTime',
    Volume = 'volume',
    CapQueue = 'capQueue',
    QueueCap = 'queueCap',
    ShouldBinomial = 'shouldBinomial',
    BinomialTrials = 'binomialTrials',
    BinomialProb = 'binomialProb',
    Reload = 'reload'
}

const { audio, config } = window.api.init();
const ctx = new (window.AudioContext)();
const masterGain = ctx.createGain();
masterGain.gain.value = 1;
const comp = ctx.createDynamicsCompressor();
comp.threshold.value = -24;
comp.knee.value = 30;
comp.ratio.value = 12;
comp.attack.value = 0.003;
comp.release.value = 0.25;
masterGain.connect(comp);
comp.connect(ctx.destination);

const setMasterVolume = (v: number) => {
    const now = ctx.currentTime;
    masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), now, 0.015)
}

const connectElementToMaster = (element: HTMLAudioElement) => {
    const node = new MediaElementAudioSourceNode(ctx, { mediaElement: element });
    node.connect(masterGain);
    return node;
}

let useBinomial = config.useBinomial ?? false;
let binomialParams = [config.binomialTrials ?? 1, config.binomialProb ?? 0.5];
let maxQueue = config.queueCap ?? 50;
let capQueue = config.capQueue ?? false;
let stopSpawn = false;
let sfxEnabled = false;
let runningMethods = 1;
let isTesting = window.api.isDev();
let maxRandomInterval = isTesting ? 1 : 120;
let minQueueSong = 60;
let shouldIgnoreUntagged = config.ignoreUntagged ?? false;

//let nowPlaying = document.getElementById('nowPlaying') as HTMLParagraphElement;

let toggleSFXB = document.getElementById('toggleSFX') as HTMLButtonElement;

let changeSFXCount = document.getElementById('changeSFXCount') as HTMLInputElement;

let changeSFXCD = document.getElementById('changeSFXCD') as HTMLInputElement;

let minQueueTime = document.getElementById('changeQueueTime') as HTMLInputElement;
let minQueueTimeLab = document.getElementById('changeQueueTimeLab') as HTMLLabelElement;

let volumeSlider = document.getElementById('volume') as HTMLInputElement;

let settings = document.getElementById('settings') as HTMLDivElement;
let submitReload = document.getElementById('reloadApp') as HTMLButtonElement;

let directorySelector = document.getElementById('changeDir') as HTMLInputElement;
let dirSelLabel = document.getElementById('changeDirLab') as HTMLLabelElement;

let ignoredFolders = document.getElementById('ignoredFolders') as HTMLInputElement;
let ignoreFolLab = document.getElementById('ignoreFolLab') as HTMLLabelElement;

let ignoreUntagged = document.getElementById('ignoreUntagged') as HTMLInputElement;
let ignoreUnLab = document.getElementById('ignoreUntaggedLab') as HTMLLabelElement;

let capQueueEl = document.getElementById('capQueue') as HTMLInputElement;
let capQueueLab = document.getElementById('ignoreUntaggedLab') as HTMLLabelElement;

let queueCapEl = document.getElementById('queueCap') as HTMLInputElement;
let queueCapLab = document.getElementById('queueCapLab') as HTMLLabelElement;

let shouldBinomial = document.getElementById('shouldBinomial') as HTMLInputElement;
let shouldBinomialLab = document.getElementById('shouldBinomialLab') as HTMLLabelElement;
let binomialTrials = document.getElementById('binomialTrials') as HTMLInputElement;
let binomialTrialsLab = document.getElementById('binomialTrialsLab') as HTMLLabelElement;
let binomialProb = document.getElementById('binomialProb') as HTMLInputElement;
let binomialProbLab = document.getElementById('binomialProbLab') as HTMLLabelElement;

settings.style.display = 'none';
shouldBinomial.checked = config.useBinomial ?? false;
binomialTrials.value = `${binomialParams[0]}`;
binomialProb.value = `${binomialParams[1]}`
changeSFXCount.value = `${runningMethods}`;
changeSFXCD.value = `${maxRandomInterval}`;
ignoreUntagged.checked = shouldIgnoreUntagged;
minQueueTime.value = `${minQueueSong}`;
volumeSlider.value = `${config.volume}`;
setMasterVolume(config.volume ?? 75 / 100);

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

volumeSlider.addEventListener('input', () => {
    config.volume = volumeSlider.valueAsNumber
    setMasterVolume(volumeSlider.valueAsNumber / 100)
});



const changeConfig: changeConfig = (e) => {
        if (e === changeConfigOpts.Directory) {
            if (directorySelector.value == "") {

                directorySelector.style.backgroundColor = "";
                return;

            }

            if (window.api.dirExists(directorySelector.value)) {

                console.log('changeDirectory value is good');

                directorySelector.style.backgroundColor = "#2bff00";
                config.directory = directorySelector.value;

                dirSelLabel.style.color = "#ff0000"

                window.api.setConfig(config);

        } else {

            console.log('changeDirectory value is bad')

            directorySelector.style.backgroundColor = "#ff0000"
        }
    } else if (e === changeConfigOpts.IgnoreFolders) {

        if (ignoredFolders.value == "") {
            ignoredFolders.style.backgroundColor = "";
            return;
        }

        const toIgnore: string[] = []
            try {
                toIgnore.push(...ignoredFolders.value.split(','));
            } catch {
                ignoredFolders.style.backgroundColor = "#ff0000"
                return;
            }

            ignoredFolders.style.backgroundColor = "#2bff00"
            config.ignoredFolders = toIgnore;

            ignoreFolLab.style.color = "#ff0000"

            window.api.setConfig(config);

    } else if (e === changeConfigOpts.IgnoreUntagged) {

        config.ignoreUntagged = ignoreUntagged.checked;

        ignoreUnLab.style.color = "#ff0000";

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.Volume) {

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.CapQueue) {

        console.log('clicked')

        capQueue = capQueueEl.checked;
        
        config.capQueue = capQueueEl.checked;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.QueueCap) {

        if (queueCapEl.value == "") {
            queueCapEl.style.backgroundColor = "";
            return;
        }

        if (Number.parseInt(queueCapEl.value)) {

            queueCapEl.style.backgroundColor = "#2bff00"
            config.queueCap = queueCapEl.valueAsNumber;

            window.api.setConfig(config);
        } else {
            queueCapEl.style.backgroundColor = "#ff0000"
        }

    } else if (e === changeConfigOpts.ShouldBinomial) {

        useBinomial = shouldBinomial.checked;
        config.useBinomial = shouldBinomial.checked;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.BinomialTrials || e === changeConfigOpts.BinomialProb) {

        if (Number.parseInt(binomialTrials.value) && Number.parseFloat(binomialProb.value)) {

            binomialTrials.style.backgroundColor = "#2bff00"
            binomialProb.style.backgroundColor = "#2bff00"

            binomialParams[0] = Number.parseInt(binomialTrials.value);
            binomialParams[1] = Number.parseFloat(binomialProb.value);

            config.binomialTrials = binomialParams[0];
            config.binomialProb = binomialParams[1];

            window.api.setConfig(config);

        } else {

            binomialTrials.style.backgroundColor = "#ff0000";
            binomialProb.style.backgroundColor = "#ff0000";

        }

    } else if (e === changeConfigOpts.Reload) {

        window.api.reload('main');

    }
}

directorySelector.addEventListener('input', () => changeConfig(changeConfigOpts.Directory));
ignoredFolders.addEventListener('input', () => changeConfig(changeConfigOpts.IgnoreFolders));
capQueueEl.addEventListener('click', () => changeConfig(changeConfigOpts.CapQueue));
queueCapEl.addEventListener('input', () => changeConfig(changeConfigOpts.QueueCap));
shouldBinomial.addEventListener('click', () => changeConfig(changeConfigOpts.ShouldBinomial));
binomialTrials.addEventListener('input', () => changeConfig(changeConfigOpts.BinomialTrials));
binomialProb.addEventListener('input', () => changeConfig(changeConfigOpts.BinomialProb));
submitReload.addEventListener('click', () => changeConfig(changeConfigOpts.Reload));

volumeSlider.addEventListener('change', () => {
    changeConfig(changeConfigOpts.Volume);
})

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
            setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval));
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
            runningMethods = 1;
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
            maxRandomInterval = 120;
            console.error(`Invalid response for SFX cooldown value`);
            return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
        }
    } else if (e === 'ignoreUntagged') {

        if (typeof ignoreUntagged.checked === "boolean") {
            shouldIgnoreUntagged = ignoreUntagged.checked;

            changeConfig(changeConfigOpts.IgnoreUntagged);

            return [`success`, `stored ${ignoreUntagged.checked} boolean in shouldIgnoreUntagged: ${shouldIgnoreUntagged}`];
        } else {
            console.error(`${ignoreUntagged.checked} was not a boolean`);
            return [`fail`, `shouldIgnoreUntagged remained unchanged.`];
        }
    } else if (e === 'minQueueTime') {

        let objValue = Number.parseInt(minQueueTime.value);

        if (Number.isInteger(objValue)) {
            minQueueSong = objValue;
            return [`success`, `maxRandomInterval changed to ${objValue}`];
        } else {
            minQueueTime.value = '60';
            minQueueSong = 60;
            console.error(`Invalid response for SFX cooldown value`);
            return [`fail`, `maxRandomInterval defaulted to 120 seconds`];
        }
    }
}

const nextAudio = (sfx: HTMLAudioElement) => {

    let queueCheck = queue.shift()
    if (queueCheck?.loc) {
        queueCheck.volume = connectElementToMaster(sfx);
        isPlaying.push(queueCheck)
    } else {
        return;
    }

    const onEnded = () => {

            try { sfx.pause() } catch {}


            let index = isPlaying.findLastIndex(e => e.src === sfx.src);

            isPlaying[index].volume?.disconnect()

            if (index !== -1)
                isPlaying.splice(index, 1);

            let checkQueue = (e: any) => e.duration > minQueueSong || e.tag === 'song';
            if (isPlaying.filter(checkQueue).length > 0)
                return;
            
            if (queue.filter(checkQueue).length > 0) {
                nextAudio(new Audio(queue.filter(checkQueue)[0].loc))
            }

            sfx.removeAttribute('src')
            sfx.onended = null;
            sfx.onerror = null;
            sfx.load()
    }

    sfx.onended = onEnded

    sfx.play()
    //nowPlaying.innerText = `${queueCheck.loc.split('/')[queueCheck.loc.split('/').length - 1]}`;

    console.log('played sound!');

    if (queue.length <= (maxQueue - 20))
        stopSpawn = false;
}

const playAudio = async () => {
    let sfx = new Audio(queue[0].loc);
    let sfxTag = queue[0].tag;

    //sfx.muted = true;

    const getAudioDuration = (sfx: HTMLAudioElement): Promise<number> => {

        return new Promise((resolve, reject) => {

            sfx.preload = 'metadata';
            
            const onLoaded = () => {
                cleanup();
                resolve(sfx.duration);
            };

            const onError = () => {
                cleanup();
                reject(new Error("Cannot load metadata"));
            };

            const cleanup = () => {
                sfx.removeEventListener('loadedmetadata', onLoaded);
                sfx.removeEventListener('error', onError);
            };

            sfx.addEventListener('loadedmetadata', onLoaded);
            sfx.addEventListener('error', onError);

            sfx.load()
        });
    }

    if (!shouldIgnoreUntagged) {
        queue[0].duration = await getAudioDuration(sfx);

        if (isPlaying.filter(e => e.duration >= minQueueSong).length == 0 || sfx.duration < minQueueSong)
            nextAudio(sfx);
        return;
    }

    if ((isPlaying.filter(e => e.tag === 'song').length == 0) || sfxTag !== 'song') {
        nextAudio(sfx);
    }
}

const halt = async () => {
    while(stopSpawn)
        await sleep()

    setTimeout(runSFX, Math.floor(Math.random() * maxRandomInterval));
}

const runSFX = async () => {

    if (!sfxEnabled) return;

    if (useBinomial) {
        let x = window.api.choose.binomial(...binomialParams);

        if (x == 0) {
            console.log('obstructed by binomial')
            return halt();
        }
    }

    if (queue.length >= maxQueue) {
        if (capQueue) stopSpawn = true;
    }

    let sfx = window.api.choose.choice(audio) as loadedAudio;

    queue.unshift(sfx);

    console.log(`${sfx.loc}\n${sfx.tag}\nAudio Length: ${audio.length - 1} / ${audio.length}`)

    await playAudio();

    halt()
}