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
        // called when the scene starts,
        // use it to create your game objects

        let backTile = this.add.tileSprite(
            this.scale.canvas.width / 2,
            this.scale.canvas.height / 2,
            this.scale.canvas.width,
            this.scale.canvas.height,
            'HD-Space-Wallpaper-For-Background-11');

        let title = this.add.image(
            this.scale.canvas.width / 2,
            128,
            'title'
        );
        title.setOrigin(0.5);

        this.scale.on('resize', ({ width, height }) => {
            // update viewport accordingly
            this.cameras.main.setViewport(0, 0, width, height);
            btn1.setX(width / 2);
            btn2.setX(width / 2);
            btn3.setX(width / 2);
            backTile.width = width;
            backTile.x = width / 2;
            backTile.height = height;
            backTile.y = height / 2;
        });


        let centerX = this.game.canvas.width / 2;
        let centerY = this.game.canvas.height / 2;

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
