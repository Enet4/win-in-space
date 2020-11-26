/// the number of milliseconds per new point to record
const MS_PER_POINT = 30;

export interface Position {
    x: number;
    y: number;
}

export default class TrajectoryBuilder {

    public path: Phaser.Curves.Path | null;
    private timeElapsed: number;

    constructor() {
        this.path = null;
        this.timeElapsed = 0;
    }

    setUp(pos: Position): Phaser.Curves.Path {
        this.path = new Phaser.Curves.Path(pos.x, pos.y);
        this.timeElapsed = 0;
        return this.path;
    }

    update(delta: number, pos: Position) {
        if (!this.path) {
            return;
        }

        this.timeElapsed += delta;

        if (this.timeElapsed >= MS_PER_POINT) {
            this.path.lineTo(pos.x, pos.y);
            this.timeElapsed -= MS_PER_POINT;
        }
    }
}