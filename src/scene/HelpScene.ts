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
        this.scale.on('resize', ({width, height}) => {
            // update viewport accordingly
            this.cameras.main.setViewport(0, 0, width, height);
        });

        let {width, height} = this.scale.canvas;

        // the help text for start
        let contents = [
            { x: width / 4, y: 32, msgKey: 'help.1'},
            { x: 3 * width / 4, y: 32, msgKey: 'help.2'},
            { x: width / 4, y: height / 2, msgKey: 'help.3'},
            { x: 3 * width / 4, y: height / 2, msgKey: 'help.4'},
        ];
        contents.map(({x, y, msgKey}) =>
            this.createMessage(x, y, localized(msgKey))
        );

        this.add.image(width / 4, 70, 'guide1') // 3.15 ratio
            .setOrigin(0.5, 0)
            .setDisplaySize(height * 1.071, height * 0.34)

        this.add.image(3 * width / 4, 70, 'guide2') // 1.5238 ratio
            .setOrigin(0.5, 0)
            .setDisplaySize(height * 0.533, height * 0.35);

        this.add.image(width / 4, height / 2 + 32, 'guide3') // 1.359 ratio
            .setOrigin(0.5, 0)
            .setDisplaySize(height * 0.5164, height * 0.38);

        this.add.image(3 * width / 4, height / 2 + 42, 'guide4') // 2.3675 ratio
            .setOrigin(0.5, 0)
            .setDisplaySize(height * 0.8286, height * 0.35);

        let fnBack = () => {
            this.scale.off('resize');
            this.scene.start('MenuScene');
        };

        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 20,
            localized('menu.back'),
            fnBack
        ).setOrigin(0.5, 1);

        let btnOk = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true, true);
        btnOk.addListener('up', fnBack);

    }
}
