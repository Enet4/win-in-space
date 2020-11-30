import * as Phaser from 'phaser';
import { localized } from '../locale';

export default class HelpScene extends Phaser.Scene {
    private assetsLoaded: boolean;

    constructor() {
        super({
            key: 'HelpScene'
        });
        this.assetsLoaded = false;
    }

    init(data) {
    }

    preload() {
        if (this.assetsLoaded) {
            return;
        }
        let txtLoading = this.add.text(
            this.scale.canvas.width / 2,
            this.scale.canvas.height / 2,
            localized('boot.loading'), {
                fontFamily: 'lemonmilk',
                fontSize: '20pt',
                align: 'center',
            });
        txtLoading.setOrigin(0.5);

        this.load.image('guide1', 'assets/images/guide1.png');
        this.load.image('guide2', 'assets/images/guide2.png');
        this.load.image('guide3', 'assets/images/guide3.png');
        this.load.image('guide4', 'assets/images/guide4.png');

        this.load.on('complete', () => {
            this.assetsLoaded = true;
            txtLoading.destroy();
        });
    }

    private createButton(x: number, y: number, text: string, onClick: (event: any) => void) {
        let optionStyle = {
            fill: 'white',
            align: 'center',
            fontFamily: 'lemonmilk',
            fontSize: '30pt',
            backgroundColor: '#002277',
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

    private createMessage(x: number, y: number, text: string) {
        let optionStyle = {
            fill: 'white',
            align: 'center',
            fontFamily: 'lemonmilk',
            fontSize: '18pt',
            backgroundColor: '#000040C0',
        };
        let txt = this.add.text(x, y, text, optionStyle);
        txt.setOrigin(0.5);
        return txt;
    }

    create() {
        // called when the scene starts,
        // use it to create your game objects

        this.scale.on('resize', ({width, height}) => {
            // update viewport accordingly
            this.cameras.main.setViewport(0, 0, width, height);
        });

        let {width, height} = this.scale.canvas;

        // the help text for start
        let contents = [
            { x: width / 4, y: 40, msgKey: 'help.1'},
            { x: 3 * width / 4, y: 40, msgKey: 'help.2'},
            { x: width / 4, y: 408, msgKey: 'help.3'},
            { x: 3 * width / 4, y: 408, msgKey: 'help.4'},
        ];
        contents.map(({x, y, msgKey}) =>
            this.createMessage(x, y, localized(msgKey))
        );

        let guide1 = this.add.image(width / 4, 232, 'guide1');
        guide1.setDisplaySize(width * 0.46, width * 0.15)

        let guide2 = this.add.image(3 * width / 4, 240, 'guide2');
        guide2.setScale(0.65, 0.65);

        let guide3 = this.add.image(240, 600, 'guide3');
        guide3.setScale(0.5, 0.5);

        let guide4 = this.add.image(3 * width / 4, 600, 'guide4');
        guide4.setScale(0.64, 0.64);

        let fnBack = () => {
            this.scale.off('resize');
            this.scene.start('MenuScene');
        };

        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            localized('menu.back'),
            fnBack);

        let btnOk = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true, true);
        btnOk.addListener('up', fnBack);

    }
}
