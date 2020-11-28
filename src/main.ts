import * as Phaser from 'phaser';
import BootScene from './scene/BootScene';
import MenuScene from './scene/MenuScene';
import HelpScene from './scene/HelpScene';
import SpaceScene from './scene/SpaceScene';
import HudScene from './scene/HudScene';
import ReallyQuitScene from './scene/ReallyQuitScene';
import BackgroundScene from './scene/BackgroundScene';
import SummaryScene from './scene/SummaryScene';
import LevelSelectScene from './scene/LevelSelectScene';
import storeFacade from './storeFacade';

let game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth < 800 ? 800 : window.innerWidth,
    height: window.innerHeight-32 < 600 ? 600 : window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    zoom: 0.005,
    render: {
        pixelArt: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            // this is space
            gravity: { y: 0 }
        }
    },
    audio: {
        noAudio: false,
        disableWebAudio: false
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
    },
    scene: [
        new BootScene(),
        new MenuScene(),
        new HelpScene(),
        new LevelSelectScene(),
        new SpaceScene(),
        new HudScene(),
        new ReallyQuitScene(),
        new BackgroundScene(),
        new SummaryScene(),
    ],
    parent: 'content'
});

game.scale.on('resize', (data) => {
    console.debug('RESIZE:', data);
});

(document.getElementById('content') as HTMLCanvasElement).oncontextmenu = (e) => {
    e.preventDefault();
}

function initMusicConfig() {
    let musicEnabled = storeFacade.getItem("musicEnabled");
    if (musicEnabled === null) {
        musicEnabled = "true";
    }
    let aToggleMusic = document.getElementById("a-toggle-music");
    if (!aToggleMusic) {
        console.error("Missing toggle music text");
        return;
    }
    if (musicEnabled === "false") {
        aToggleMusic.innerText = "Enable music";
    } else {
        aToggleMusic.innerText = "Disable music";
    }

    storeFacade.setItem("musicEnabled", musicEnabled);
}

initMusicConfig();

function toggleMusic() {
    let aToggleMusic = document.getElementById("a-toggle-music");
    if (!aToggleMusic) {
        console.error("Missing toggle music text");
        return;
    }
    let musicEnabled = storeFacade.getItem("musicEnabled") === "false";
    if (!musicEnabled) {
        game.sound.stopByKey('win-in-space');
        aToggleMusic.innerText = "Enable music";
    } else {
        aToggleMusic.innerText = "Disable music";
        game.sound.play('win-in-space', {loop: true, volume: 0.7});
    }
    storeFacade.setItem("musicEnabled", musicEnabled.toString());
}

/// global export
window["toggleMusic"] = toggleMusic;
