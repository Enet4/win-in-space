import * as Phaser from 'phaser';
import { localized } from '../locale';

export default class HelpScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'HelpScene'
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
            fontFamily: 'lemonmilk',
            fontSize: '32pt',
            backgroundColor: '#000040C0',
        };
        let txt = this.add.text(x, y, text, optionStyle);
        txt.setOrigin(0.5);
        txt.setInteractive();
        txt.on('pointerdown', () => {
            txt.setFill("#3070DF");
        });
        txt.on('pointerup', (ev: any) => {
            txt.setFill("#70F7FF");
            onClick(ev);
        });
        txt.on('pointerover', () => {
            txt.setFill("#70F7FF");
        });
        txt.on('pointerout', () => {
            txt.setFill('white');
        });
        return txt;
    }

    private createMessage(x: number, y: number, text: string) {
        let optionStyle = {
            fill: 'white',
            align: 'left',
            fontSize: '18pt',
            backgroundColor: '#000040C0',
        };
        let txt = this.add.text(x, y, text, optionStyle);
        //txt.setOrigin(0.5);
        return txt;
    }

    create() {
        // called when the scene starts,
        // use it to create your game objects

        this.scale.on('resize', ({width, height}) => {
            // update viewport accordingly
            this.cameras.main.setViewport(0, 0, width, height);
        });

        // the help text for start
        let contents = [
            { y: 100, msgKey: 'help.1'},
            { y: 200, msgKey: 'help.2'},
            { y: 300, msgKey: 'help.3'},
            { y: 400, msgKey: 'help.4'},
        ];
        contents.map(({y, msgKey}) =>
            this.createMessage(32, y, localized(msgKey))
        );

        let fnBack = () => {
            this.scale.off('resize');
            this.scene.start('MenuScene');
        };

        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            localized('help.back'),
            fnBack);

        let btnOk = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true, true);
        btnOk.addListener('up', fnBack);

    }
}
