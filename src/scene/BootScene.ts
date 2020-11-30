import * as Phaser from 'phaser';
import { localized } from '../locale';
import storeFacade from '../storeFacade';

class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'BootScene'
        });
    }
    preload() {
        console.log("i am boot");

        const progress = this.add.graphics();

        this.load.on('progress', (value: number) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(16, +this.sys.game.config.height / 2, (+this.sys.game.config.width - 32) * value, 60);
        });

        let txtLoading = this.add.text(
            this.scale.canvas.width / 2,
            this.scale.canvas.height / 2 + 120,
            localized('boot.loading'), {
                fontFamily: 'lemonmilk',
                fontSize: '20pt',
                align: 'center',
            });
        txtLoading.setOrigin(0.5);


        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on('complete', () => {
            if (storeFacade.getItem('musicEnabled') === 'true') {
                this.sound.play('win-in-space', {loop: true, volume: 0.7});
            }
            setTimeout(() => this.scene.start('MenuScene'), 100);
        });
        
        // load graphics: images and spritesheets
        this.load.image('title', 'assets/images/title.png');
        this.load.image('planet_gamma', 'assets/images/Arcadian_Planet_Gamma.png');
        this.load.image('planet_neptune', 'assets/images/painted-blue-planet-Neptune.png');
        this.load.image('planet_blue', 'assets/images/HD_189733_b.png');
        this.load.image('Dysnomia_moon', 'assets/images/Dysnomia-moon.png');

        this.load.image('tiny-star', 'assets/images/tiny-star.png');
        this.load.image('round-spark', 'assets/images/round-spark.png');
        this.load.image('flare', 'assets/images/flare.png');
        this.load.image('bullet168', 'assets/images/bullet168.png');
        this.load.image('canon', 'assets/images/canon.png');
        this.load.image('flag-purple', 'assets/images/flag-purple.png');
        this.load.image('flag-cyan', 'assets/images/flag-cyan.png');

        this.load.image('HD-Space-Wallpaper-For-Background-11', 'assets/images/HD-Space-Wallpaper-For-Background-11.jpg');
        const BACKGROUNDS = [
            'background-3907905_1920',
            'background-3908098_1920',
            'universe-2303321_1920'
        ];
        for (const bg of BACKGROUNDS) {
            this.load.image(bg, `assets/images/${bg}.jpg`);
        }

        // load music and sound effects
        this.load.audio('muffled-distant-explosion', 'assets/sounds/muffled-distant-explosion.ogg');
        this.load.audio('chunky-explosion', 'assets/sounds/chunky-explosion.ogg');
        this.load.audio('bang', 'assets/sounds/bang.ogg');
        
        this.load.audio('win-in-space', 'assets/bgm/win in space-v0.4.ogg');
    }
}

export default BootScene;
