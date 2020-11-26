import { localized } from "../locale";
import { Statistics } from "./SpaceScene";

export default class SummaryScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'SummaryScene'
        });
    }

    public create(data: Statistics) {
        console.debug(`[SummaryScene] create`, data);

        let labelStyle = {
            fontFamily: 'lemonmilk',
            fontSize: '14pt',
            align: 'center',
            fill: '#C0C0C0',
        };

        let w = 550;
        let h = 100;
        let playerName = data.longestLivingPlayerId === 0 ? localized('game.player_one') : localized('game.player_two');
        let ui = this.add.container(this.scale.canvas.width / 2, this.scale.canvas.height / 2, [
            this.add.rectangle(0, 0, w, h, 0x002277, 1),
            this.add.text(-240, -44, localized('game.summary'), {
                fontFamily: 'lemonmilk',
                fontSize: '18pt',
                align: 'center',
                fill: '#C0C0C0',
            }),

            // number of rounds
            this.add.text(-240, -20, `${localized('game.summary.rounds')}: `, labelStyle),
            this.add.text(0, -20, `${data.numRound}`, labelStyle),

            // longest living projectile
            this.add.text(-240, 0, `${localized('game.summary.longlife_projectile')}: `, labelStyle),
            this.add.text(0, 0, `${data.longestLiving / 1000} s (${localized('game.summary.longlife_projectile')} ${playerName})`, labelStyle),
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

