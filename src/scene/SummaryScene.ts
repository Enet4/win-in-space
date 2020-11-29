import { localized } from "../locale";
import { Statistics } from "./SpaceScene";

export default class SummaryScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'SummaryScene'
        });
    }

    public create(data: Statistics & {onQuit: () => void}) {
        console.debug(`[SummaryScene] create`, data);

        let labelStyle = {
            fontSize: '12pt',
            align: 'center',
            fill: '#E0E0E0',
        };

        let w = 590;
        let h = 280;
        let playerName = data.longestLivingPlayerId === 0 ? localized('game.player_one') : localized('game.player_two');
        const parts = [
            this.add.rectangle(0, 0, w, h, 0x002277, 0.5),
            this.add.text(0, -88, localized('game.summary'), {
                fontFamily: 'lemonmilk',
                fontSize: '18pt',
                align: 'center',
                fill: '#F0F0F0',
            }).setOrigin(0.5),

            // number of rounds
            this.add.text(-270, -36, `${localized('game.summary.rounds')}:  ${data.numRound}`, labelStyle),

            // longest living projectile
            this.add.text(-270, -8, `${localized('game.summary.longlife_projectile')}:  `
                + `${(data.longestLiving / 1000).toFixed(2)} s `
                + `(${localized('game.summary.longlife_projectile.by')} ${playerName})`,
                labelStyle),

            // force of final shot
            this.add.text(-270, 22, `${localized('game.summary.force_final_shot')}:  ${data.powerLastShot}`, labelStyle),

            // exit button
            this.createButton(0, 100, localized("game.exit"), () => {
                this.scene.stop('SummaryScene');
                data.onQuit();
            })
        ];
        if (!data.selfDestruct && data.powerLastShot === 1) {
            parts.push(
                this.add.text(0, 60, localized('game.summary.green'), {
                    ...labelStyle,
                    fontSize: '14pt',
                    fill: 'green',
                }).setOrigin(0.5)
            );
        }
        let ui = this.add.container(this.scale.canvas.width / 2, this.scale.canvas.height / 2, parts);
    
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
        txt.setOrigin(0.5);
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

