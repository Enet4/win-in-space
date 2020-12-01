import * as Phaser from 'phaser';
import { localized } from '../locale';

class MenuScene extends Phaser.Scene {

    private buttons: any;

    constructor() {
        super({
            key: 'MenuScene'
        });
    }

    init(data) {
        // called before preload
        console.debug("MenuScene init");
    }

    preload() {
        console.debug("MenuScene preload");
        // use this to load assets
    }

    private createButton(x: number, y: number, text: string, onClick: (event: any) => void) {
        let optionStyle = {
            fill: 'white',
            align: 'center',
            fontSize: '32pt',
            fontFamily: 'lemonmilk',
            backgroundColor: '#000040C0',
        };
        let txt = this.add.text(x, y, text, optionStyle);
        txt.setOrigin(0.5);
        txt.setInteractive();
        txt.on('pointerdown', () => {
            txt.setFill("#3070DF");
        });
        txt.on('pointerup', (ev: any) => {
            txt.setFill('yellow');
            onClick(ev);
        });
        txt.on('pointerover', () => {
            txt.setFill('yellow');
        });
        txt.on('pointerout', () => {
            txt.setFill('white');
        });
        return txt;
    }

    create() {
        let back = this.add.image(0, 0, 'HD-Space-Wallpaper-For-Background-11')
            .setOrigin(0, 0);

        function fixScale(width, height) {
            let wRatio = width / 1920;
            let hRatio = height / 1080;
            back.setScale(Math.max(wRatio, hRatio));
        }
        fixScale(this.scale.canvas.width, this.scale.canvas.height);

        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        let title = this.add.image(
            centerX,
            128,
            'title'
        ).setOrigin(0.5);

        this.scale.on('resize', ({ width, height }) => {
            // update viewport and objects accordingly
            this.cameras.main.setViewport(0, 0, width, height);
            btn1.setPosition(width / 2, height / 2 - 60);
            btn2.setPosition(width / 2, height / 2 + 60);
            btn3.setPosition(width / 2, height / 2 + 180);
            title.setX(width / 2);
            fixScale(width, height);
        });

        // the text for start
        let btn1 = this.createButton(centerX, centerY - 60, localized('menu.one_player'), (_ev) => {
            this.scale.off('resize');
            this.scene.start('LevelSelectScene', { players: 1 });
        });

        let btn2 = this.createButton(centerX, centerY + 60, localized('menu.two_players'), (_ev) => {
            this.scale.off('resize');
            this.scene.start('LevelSelectScene', { players: 2 });
        });

        let btn3 = this.createButton(centerX, centerY + 180, localized('menu.help'), (_ev) => {
            this.scale.off('resize');
            this.scene.start('HelpScene');
        });
    }
}


export default MenuScene;
