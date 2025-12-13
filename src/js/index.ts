
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
    ShouldDiscordBot = 'shouldDiscordBot',
    DiscordBotToken = 'discordBotToken',
    DiscordBotClient = 'discordBotClient',
    Reload = 'reload'
}

const { audio, config } = window.api.init();
const ctx = new (window.AudioContext)();
const masterGain = ctx.createGain();
masterGain.gain.value = config.volume ? config.volume / 100 : 1;
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

(() => {
    let text = document.getElementById('requiresReload') as HTMLParagraphElement;

    if (!config.useDiscordBot)
        return;

    text!.innerText = `${text!.innerText} (useDiscordBot = true, please SUBMIT then fully restart the app for changes to take affect)`
})()

let useBinomial = config.useBinomial ?? false;
let useDiscordBot = config.useDiscordBot ?? false;
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
let shouldReload: Array<changeConfigOpts> = [];

const toLoad: Array<loadElements> = [
    { id: `toggleSFX`, hasLabel: false, type: 'button' },
    { id: `changeSFXCount`, hasLabel: false, type: `input` },
    { id: `changeSFXCD`, hasLabel: false, type: 'input' },
    { id: `changeQueueTime`, hasLabel: true, type: `input` },
    { id: `volumeSlider`, hasLabel: false, type: `input` },
    { id: `settings`, hasLabel: false, type: `div` },
    { id: `reloadApp`, hasLabel: false, type: 'button' },
    { id: `changeDir`, hasLabel: true, type: `input` },
    { id: `ignoredFolders`, hasLabel: true, type: `input` },
    { id: `ignoreUntagged`, hasLabel: true, type: `input` },
    { id: `capQueueEl`, hasLabel: true, type: 'input' },
    { id: `queueCap`, hasLabel: true, type: `input` },
    { id: `shouldDiscordBot`, hasLabel: true, type: `input` },
    { id: `discordBotToken`, hasLabel: true, type: `input` },
    { id: `discordBotClient`, hasLabel: true, type: `input` },
    { id: `shouldBinomial`, hasLabel: true, type: `input` },
    { id: `binomialTrials`, hasLabel: true, type: `input` },
    { id: `binomialProb`, hasLabel: true, type: `input` },
    { id: `minQueueTime`, hasLabel: true, type: `input` }
]

const loadedDOMElements: Partial<loadedDOMElements> = {};

const getElement = <E extends loadElements>(e: E): elementMap[E['type']] => document.getElementById(e.id) as elementMap[E['type']];
const getLabelElement = <L extends loadLabels>(e: L): labelElementMap[L['type']] => document.getElementById(e.id) as labelElementMap[L['type']];

for (const e of toLoad) {

    let label: loadLabels = {
        id: `toggleSFXLab`,
        type: 'label'
    };

    if (e.hasLabel)
        label.id = `${e.id}Lab`

    loadedDOMElements[e.id] = getElement(e);
    if (e.hasLabel)
        loadedDOMElements[`${e.id}Lab`] = getLabelElement(label)
}

const {
    settings,
    shouldBinomial,
    shouldBinomialLab,
    binomialProb,
    binomialTrials,
    binomialTrialsLab,
    binomialProbLab,
    changeSFXCount,
    changeSFXCD,
    changeDir,
    changeDirLab,
    changeQueueTime,
    changeQueueTimeLab,
    queueCapLab,
    queueCap,
    capQueueEl,
    capQueueElLab,
    shouldDiscordBot,
    discordBotClient,
    discordBotToken,
    discordBotClientLab,
    discordBotTokenLab,
    shouldDiscordBotLab,
    ignoreUntagged,
    ignoreUntaggedLab,
    ignoredFolders,
    ignoredFoldersLab,
    minQueueTime,
    minQueueTimeLab,
    volumeSlider,
    reloadApp
} = loadedDOMElements as strictDesctructure

//let nowPlaying = document.getElementById('nowPlaying') as HTMLParagraphElement;

settings.style.display = 'none';
shouldBinomial.checked = config.useBinomial ?? false;
binomialTrials.value = `${binomialParams[0]}`;
binomialProb.value = `${binomialParams[1]}`
changeSFXCount.value = `${runningMethods}`;
changeSFXCD.value = `${maxRandomInterval}`;
ignoreUntagged.checked = shouldIgnoreUntagged;
minQueueTime.value = `${minQueueSong}`;
volumeSlider.value = `${config.volume}`;

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
    config.volume = Number.parseInt(volumeSlider.value);
    setMasterVolume(Number.parseInt(volumeSlider.value) / 100);
    changeConfig(changeConfigOpts.Volume);
});

const changeConfig: changeConfig = (e, isInput) => {
    if (e === changeConfigOpts.Directory) {

        if (isInput) {

            if (changeDir.value == "") {

                changeDir.style.backgroundColor = "";
                return;

            }
            
            if (window.api.dirExists(changeDir.value)) {

                console.log('changeDirectory value is good');

                changeDir.style.backgroundColor = "#2bff00";

                changeDirLab.style.color = "#ff0000"

                shouldReload.push(changeConfigOpts.Directory)

            } else {

                console.log('changeDirectory value is bad')

                changeDir.style.backgroundColor = "#ff0000"
            }

            return;
        }

        config.directory = changeDir.value;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.IgnoreFolders) {

        if (isInput) {
            
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

            ignoredFoldersLab.style.color = "#ff0000"

            shouldReload.push(changeConfigOpts.IgnoreFolders)
        }

        const toIgnore: string[] = []
        
        toIgnore.push(...ignoredFolders.value.split(','));

        config.ignoredFolders = toIgnore;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.IgnoreUntagged) {

        config.ignoreUntagged = ignoreUntagged.checked;

        ignoreUntaggedLab.style.color = "#ff0000";

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.Volume) {

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.CapQueue) {

        console.log('clicked')

        capQueue = capQueueEl.checked;
        
        config.capQueue = capQueueEl.checked;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.QueueCap) {

        if (isInput) {
            if (queueCap.value == "") {
                queueCap.style.backgroundColor = "";
                return;
            }

            if (Number.parseInt(queueCap.value)) {
                queueCap.style.backgroundColor = "#2bff00"
            
                shouldReload.push(changeConfigOpts.QueueCap)
            } else {
                queueCap.style.backgroundColor = "#ff0000"
            }
        }

        if (queueCap.value == "") {
            queueCap.style.backgroundColor = "";
            return;
        }

        if (Number.parseInt(queueCap.value)) {

            queueCap.style.backgroundColor = "#2bff00"
            config.queueCap = Number.parseInt(queueCap.value);

            window.api.setConfig(config);
        } else {
            queueCap.style.backgroundColor = "#ff0000"
        }

    } else if (e === changeConfigOpts.ShouldBinomial) {

        useBinomial = shouldBinomial.checked;
        config.useBinomial = shouldBinomial.checked;

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.BinomialTrials || e === changeConfigOpts.BinomialProb) {

        if (isInput) {
            if (Number.parseInt(binomialTrials.value) && Number.parseFloat(binomialProb.value)) {

                binomialTrials.style.backgroundColor = "#2bff00"
                binomialProb.style.backgroundColor = "#2bff00"

                binomialParams[0] = Number.parseInt(binomialTrials.value);
                binomialParams[1] = Number.parseFloat(binomialProb.value);

                shouldReload.push(changeConfigOpts.BinomialProb, changeConfigOpts.BinomialTrials);

            } else {

                binomialTrials.style.backgroundColor = "#ff0000";
                binomialProb.style.backgroundColor = "#ff0000";

            }
        }

        binomialParams[0] = Number.parseInt(binomialTrials.value);
        binomialParams[1] = Number.parseFloat(binomialProb.value);

        config.binomialTrials = binomialParams[0];
        config.binomialProb = binomialParams[1];

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.ShouldDiscordBot) {

        useDiscordBot = shouldDiscordBot.checked;
        config.useDiscordBot = shouldDiscordBot.checked;

        window.api.setConfig(config)

    } else if (e === changeConfigOpts.DiscordBotClient) {

        if (isInput) {

            discordBotClient.style.backgroundColor = "#2bff00"
            shouldReload.push(changeConfigOpts.DiscordBotClient);

        }

        config.discord_client_id = discordBotClient.value

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.DiscordBotToken) {

        if (isInput) {

            discordBotToken.style.backgroundColor = "#2bff00"
            shouldReload.push(changeConfigOpts.DiscordBotToken);

        }

        config.discord_token = discordBotToken.value

        window.api.setConfig(config);

    } else if (e === changeConfigOpts.Reload) {

        while (shouldReload.length > 0) {

            changeConfig(shouldReload.shift()!);

        }

        window.api.reload('main');

    }
}

changeDir.addEventListener('input', () => changeConfig(changeConfigOpts.Directory, true));
ignoredFolders.addEventListener('input', () => changeConfig(changeConfigOpts.IgnoreFolders, true));
capQueueEl.addEventListener('click', () => changeConfig(changeConfigOpts.CapQueue));
queueCap.addEventListener('input', () => changeConfig(changeConfigOpts.QueueCap, true));
shouldBinomial.addEventListener('click', () => changeConfig(changeConfigOpts.ShouldBinomial));
binomialTrials.addEventListener('input', () => changeConfig(changeConfigOpts.BinomialTrials, true));
binomialProb.addEventListener('input', () => changeConfig(changeConfigOpts.BinomialProb, true));
shouldDiscordBot.addEventListener('click', () => changeConfig(changeConfigOpts.ShouldDiscordBot));
discordBotClient.addEventListener('input', () => changeConfig(changeConfigOpts.DiscordBotClient, true));
discordBotToken.addEventListener('input', () => changeConfig(changeConfigOpts.DiscordBotToken, true));
reloadApp.addEventListener('click', () => changeConfig(changeConfigOpts.Reload));

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