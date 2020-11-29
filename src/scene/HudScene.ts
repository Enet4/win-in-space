import { localized } from "../locale";

const HUD_WIDTH = 260;
const HUD_HEIGHT = 150;

export default class HudScene extends Phaser.Scene {

    private inner: Phaser.GameObjects.Container;
    private powerPad: Phaser.GameObjects.Container;
    private popMessage: Phaser.GameObjects.Text;
    private messageTimeoutHandler: NodeJS.Timeout | null;
    private fireClickHandler: () => void;
    private powerUpHandler: () => void;
    private powerDownHandler: () => void;
    private previousAngle: number | null;
    private previousForce: number | null;

    constructor() {
        super({
            key: 'HudScene'
        });
        this.messageTimeoutHandler = null;
        this.previousAngle = null;
        this.previousForce = null;
    }

    public init() {
        console.debug(`[HudScene] init`);
    }

    public preload() {
        console.debug(`[HudScene] preload`);

    }

    public create(data) {
        console.debug(`[HudScene] create`, data);
        this.fireClickHandler = data.onFire;
        this.powerUpHandler = data.onPowerUp;
        this.powerDownHandler = data.onPowerDown;

        let w = HUD_WIDTH;
        let h = HUD_HEIGHT;
        let labelStyle = {
            fontFamily: 'lemonmilk',
            fontSize: '16pt',
            fill: '#C0C0C0',
        };
        let inputStyle = {
            fontFamily: 'courier new',
            fontSize: '18pt',
            fill: '#C0C0C0',
        };
        let ui = this.add.container(0, 0, [
            this.add.rectangle(w / 2, h / 2, w, h, 0x002277, 0.25),
            this.add.text(16, 16, `${localized('game.angle')}:`, labelStyle),
            this.add.text(104, 18, '«loading»', inputStyle),
            this.add.text(17, 60, `${localized('game.force')}:`, labelStyle),
            this.add.text(104, 62, '«loading»', inputStyle),
            this.createFireButton(60, 102),
        ]);
    
        ui.setScrollFactor(0, 0);
        ui.setVisible(false);
        this.inner = ui;
 
        this.powerPad = this.add.container(0, 0, [
            this.add.rectangle(0, 0, 32, 110, 0x002277, 0.25),
            this.createPowerButton(-9, -40, '+', this.powerUpHandler),
            this.add.text(-8, -4, '«»', {fontSize: '14pt'}),
            this.createPowerButton(-9, 26, '-', this.powerDownHandler),
        ]);
        this.powerPad.setScrollFactor(0, 0);
        this.powerPad.setVisible(false);

        this.powerPad.setPosition(278, 64);

        this.popMessage = this.add.text(this.cameras.main.centerX, 64, "«undefined»", {
            fontFamily: 'lemonmilk',
            fontSize: '24pt',
            align: 'center'
        });
        this.popMessage.setOrigin(0.5);
        this.popMessage.setScrollFactor(0, 0);
        this.popMessage.setVisible(false);
    }
    
    public displayMessage(message: string, fontColor?: string, duration?: number) {
        this.popMessage.setText(message);
        this.popMessage.setVisible(true);
        fontColor = fontColor || 'white';
        this.popMessage.setColor(fontColor);
        if (duration) {
            if (this.messageTimeoutHandler) {
                clearTimeout(this.messageTimeoutHandler);
            }
            this.messageTimeoutHandler = setTimeout(() => {
                this.popMessage.setVisible(false);
            }, duration);
        }
    }

    public update(_timeElapsed: number, delta: number) {
        
    }

    public show() {
        this.inner.setVisible(true);
        this.powerPad.setVisible(true);
    }

    public hide() {
        this.inner.setVisible(false);
        this.powerPad.setVisible(false);
    }

    public isVisible() {
        return this.inner.visible;
    }

    /// hold the previous decision (so as to show the difference)
    public setPreviousDecision(angle?: number, force?: number) {
        if (typeof angle === 'number') {
            this.previousAngle = angle;
        }
        if (typeof force === 'number') {
            this.previousForce = force;
        }
    }

    public resetPreviousDecision() {
        this.previousAngle = null;
        this.previousForce = null;
    }

    public setDecision(angle?: number, force?: number) {
        if (angle !== undefined) {
            let msgAngle = String(angle);
            if (this.previousAngle !== null) {
                let diff = (angle - this.previousAngle);
                if (diff > 180) {
                    diff -= 360;
                } else if (diff < -180) {
                    diff += 360;
                }
                if (diff > 0) {
                    msgAngle += ` (+${diff})`;
                } else  if (diff < 0) {
                    msgAngle += ` (${diff})`;
                }
            }
            (this.inner.getAt(2) as Phaser.GameObjects.Text).text = msgAngle;
        }
        if (force !== undefined) {
            let msgForce = String(force);
            if (this.previousForce !== null) {
                let forceDiff = force - this.previousForce;
                if (force > this.previousForce) {
                    msgForce += ` (+${forceDiff})`;
                } else if (force < this.previousForce) {
                    msgForce += ` (${forceDiff})`;
                }
            }
            (this.inner.getAt(4) as Phaser.GameObjects.Text).text = msgForce;
            (this.powerPad.getAt(2) as Phaser.GameObjects.Text).setText(String(force));
        }
    }

    private createFireButton(x: number, y: number) {
        let txt = this.add.text(x, y, localized('game.fire'), {
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
            this.onFire(ev);
        });
        txt.on('pointerover', () => {
            txt.setFill("#FFF770");
        });
        txt.on('pointerout', () => {
            txt.setFill('#F04499');
        });
        return txt;
    }

    private createPowerButton(x: number, y: number, text: string, onClick: (evt: any) => void) {
        let txt = this.add.text(x, y, text, {
            fontSize: '16pt',
            fill: '#F04499',
            align: 'center',
            backgroundColor: '#C0C0C0',
        });
        txt.setInteractive();
        txt.on('pointerdown', (evt) => {
            txt.setFill("#440000");
            onClick(evt);
        });
        txt.on('pointerup', () => {
            txt.setFill("#FFF770");
        });
        txt.on('pointerover', () => {
            txt.setFill("#FFF770");
        });
        txt.on('pointerout', () => {
            txt.setFill('#F04499');
        });
        return txt;
    }

    private onFire(evt) {
        console.debug("[HudScene] onFire", evt);
        this.fireClickHandler();
    }
}

