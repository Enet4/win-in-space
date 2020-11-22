import { Cameras } from "phaser";

export default class SmoothCameraController extends Phaser.Cameras.Controls.SmoothedKeyControl {

    inputNavigation: boolean;
    dragPointX: number;
    dragPointY: number;
    minZoom: number;
    maxZoom: number;

    constructor(camera: Cameras.Scene2D.Camera, cursors: Phaser.Types.Input.Keyboard.CursorKeys, minZoom: number, maxZoom: number) {
        super({
            camera,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: camera.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: camera.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.08,
            drag: 0.0025,
            maxSpeed: 1.0,
            zoomSpeed: 0.021,
        });
        this.minZoom = minZoom;
        this.maxZoom = maxZoom; 
        this.inputNavigation = true;

        this.dragPointX = 0;
        this.dragPointY = 0;

        camera.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY !== 0) {
                this.onWheelY(deltaY); 
            }
        });
        camera.scene.input.on('pointerdown', (pointer) => {
            //console.debug('pointerdown', pointer.isDown);
            this.dragPointX = pointer.worldX;
            this.dragPointY = pointer.worldY;
        });
        camera.scene.input.on('pointerup', (pointer) => {
            //console.debug('pointerup', pointer.isDown);
        });

        camera.scene.input.on('pointermove', (pointer) => {
            /*
            if (this.inputNavigation) {
                if (pointer.isDown) {
                    console.debug('pointermove', pointer);
                    let deltaX = pointer.worldX - this.dragPointX;
                    let deltaY = pointer.worldY - this.dragPointY;
                    console.debug("drag ", deltaX, deltaY);
                    this.camera.pan(
                        this.camera.centerX - deltaX,
                        this.camera.centerY - deltaY,
                        50,
                        'Power2'
                    );
                }
            }
            */
        });
    }

    update(delta: number) {
        if (this.inputNavigation) {
            super.update(delta);
            if (this.camera.zoom < this.minZoom) {
                this.camera.zoom = this.minZoom;
            }
            if (this.camera.zoom > this.maxZoom) {
                this.camera.zoom = this.maxZoom;
            }
        }
    }

    onWheelY(delta: number) {
        if (this.inputNavigation) {
            let {x: mouseX, y: mouseY} = this.camera.scene.input.mousePointer;

            const zoomDelta = 0.05;

            let newZoom = (delta > 0) ? this.camera.zoom - zoomDelta : this.camera.zoom + zoomDelta;
            
            this.camera.zoomTo(newZoom, 40);
        }
    }
}