import { localized } from "../locale";

export default class ReallyQuitScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'ReallyQuitScene'
        });
    }

    public create(data) {
        console.debug(`[ReallyQuitScene] create`, data);

        let w = 550;
        let h = 100;
        let hw = (w / 4)|0;
        let ui = this.add.container(this.scale.canvas.width / 2, this.scale.canvas.height / 2, [
            this.add.rectangle(0, 0, w, h, 0x002277, 1),
            this.add.text(-240, -44, localized('game.really_quit'), {
                fontSize: '16pt',
                align: 'center',
                fill: '#C0C0C0',
            }),
            this.createButton(-hw, 20, localized('game.quit'), () => {
                let txtLose = this.add.text(
                    this.scale.canvas.width / 2,
                    this.scale.canvas.height / 2,
                    localized('game.lose'),
                    {
                        fontFamily: 'lemonmilk',
                        fontSize: '24pt',
                        fill: '#CF0000',
                        align: 'center',
                    }
                ).setOrigin(0.5);
                ui.setVisible(false);
                setTimeout(() => {
                    this.scene.stop('ReallyQuitScene');
                    data.onQuit();
                }, 1500);
            }),
            this.createButton(hw, 20, localized('game.cancel'), () => {
                setTimeout(data.onCancel, 0);
                this.scene.stop('ReallyQuitScene');
            }),
        ]);
    
        ui.setScrollFactor(0, 0);
    }
    
    public update(_timeElapsed: number, delta: number) {
        
    }

    private createButton(x: number, y: number, text: string, onClick: (event: any) => void) {
        let rect = this.add.rectangle(0, 0, 96, 34, 0xCFCFCF);
        let txt = this.add.text(0, 0, text, {
            fontFamily: 'lemonmilk',
            fontSize: '16pt',
            fill: 'black',
            align: 'center',
        });
        txt.setOrigin(0.5);
        rect.setInteractive();
        rect.on('pointerdown', () => {
            txt.setFill('black');
        });
        rect.on('pointerup', (ev: any) => {
            txt.setFill('yellow');
            onClick(ev);
        });
        rect.on('pointerover', () => {
            txt.setFill('yellow');
        });
        rect.on('pointerout', () => {
            txt.setFill('black');
        });
        return this.add.container(x, y, [rect, txt]);
    }
}
