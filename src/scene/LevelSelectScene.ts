import * as Phaser from 'phaser';
import { localized } from '../locale';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'LevelSelectScene'
        });
    }

    private createLevelButton(x: number, y: number, text: string, onClick: (event: any) => void) {
        let rect = this.add.rectangle(0, 0, 96, 96, 0x3080DF);
        rect.setInteractive();
        let txt = this.add.text(0, 0, text, {
            fill: 'white',
            align: 'center',
            fontSize: '30pt',
            fontFamily: 'lemonmilk',
        });
        txt.setOrigin(0.5);
        rect.on('pointerdown', () => {
            txt.setFill("#000000");
        });
        rect.on('pointerup', (ev: any) => {
            txt.setFill('yellow');
            onClick(ev);
        });
        rect.on('pointerover', (ev: any) => {
            txt.setFill('yellow');
        });
        rect.on('pointerout', () => {
            txt.setFill('white');
        });
        return this.add.container(x, y, [
            rect,
            txt,
        ]);
    }

    private createButton(x: number, y: number, text: string, onClick: (event: any) => void) {
        let txt = this.add.text(x, y, text, {
            fill: 'white',
            align: 'center',
            fontSize: '32pt',
            fontFamily: 'lemonmilk',
            backgroundColor: '#000040C0',
        });
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

    create(data) {
        this.add.tileSprite(
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


        let centerX = this.game.canvas.width / 2;
        let centerY = this.game.canvas.height / 2;

        let levels = ['1', '2', '3', '4', '5', '6', 'wat'];

        let x = 150;
        levels.map((levelName) => {
            this.createLevelButton(x, centerY - 90, levelName.replace('wat', '?'), (_ev) => {
                setTimeout(() => {
                    this.scene.start('SpaceScene', { players: data.players, levelName});
                }, 200);
            });
            x += 180;
        });

        this.createButton(centerX, centerY + 100, localized('menu.generated'), (_ev) => {
            setTimeout(() => {
                this.scene.start('SpaceScene', { players: data.players, levelName: 'RANDOM', levelSeed: 'meh'});
            }, 200);
        });

        this.createButton(centerX, this.game.canvas.height - 128, localized('menu.back'), (_ev) => {
            this.scale.off('resize');
            this.scene.start('MenuScene');
        });
    }
}
