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
        let ui = this.add.container(this.scale.canvas.width / 2, this.scale.canvas.height / 2, [
            this.add.rectangle(0, 0, w, h, 0x002277, 1),
            this.add.text(-240, -44, localized('game.really_quit'), {
                fontSize: '16pt',
                align: 'center',
                fill: '#C0C0C0',
            }),
            this.createButton(-100, 20, localized('game.quit'), () => {
                this.add.text(
                    this.scale.canvas.width / 2,
                    this.scale.canvas.height / 2,
                    localized('game.lose'),
                    {
                        fontFamily: 'lemonmilk',
                        fontSize: '18pt',
                        fill: '#CF0000',
                        align: 'center',
                    }
                );
                ui.setVisible(false);
                setTimeout(() => {
                    this.scene.stop('ReallyQuitScene');
                    data.onQuit();
                }, 1500);
            }),
            this.createButton(80, 20, localized('game.cancel'), () => {
                setTimeout(data.onCancel, 0);
                this.scene.stop('ReallyQuitScene');
            }),
        ]);
    
        ui.setScrollFactor(0, 0);
    }
    
    public update(_timeElapsed: number, delta: number) {
        
    }

    private createButton(x: number, y: number, text: string, onFire: (event: any) => void) {
        let txt = this.add.text(x, y, text, {
            fontSize: '16pt',
            fill: '#F04499',
            align: 'center',
            backgroundColor: '#C0C0C0',
        });
        txt.setInteractive();
        txt.on('pointerdown', () => {
            txt.setFill("#440000");
        });
        txt.on('pointerup', (ev: any) => {
            txt.setFill("#FFF770");
            onFire(ev);
        });
        txt.on('pointerover', () => {
            txt.setFill("#FFF770");
        });
        txt.on('pointerout', () => {
            txt.setFill('#F04499');
        });
        return txt;
    }
}

