export default class BackgroundScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'BackgroundScene'
        });
    }

    public create(data) {
        console.debug(`[BackgroundScene] create`, data);

        let {width, height} = this.scale.canvas;

        let background = this.add.image(width / 2, height / 2, data.background);
        background.setScrollFactor(0, 0);
        background.setDisplaySize(width, height);
        background.setTint(0x727272);
    }
    
    public update(_timeElapsed: number, _delta: number) {
        
    }
}
