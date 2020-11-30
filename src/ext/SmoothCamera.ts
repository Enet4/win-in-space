import { Cameras } from "phaser";

export default class SmoothCameraController extends Phaser.Cameras.Controls.SmoothedKeyControl {

    inputNavigation: boolean;
    dragPointX: number;
    dragPointY: number;
    dragPointX2: number;
    dragPointY2: number;
    dragging: boolean;
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
        this.dragging = false;

        camera.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY !== 0) {
                this.onWheelY(deltaY); 
            }
        });
        camera.scene.input.on('pointerdown', (pointer) => {
            if (pointer.button === 1 || pointer.button === 2) {
                this.dragPointX = pointer.position.x;
                this.dragPointY = pointer.position.y;
                this.dragPointX2 = pointer.position.x;
                this.dragPointY2 = pointer.position.y;
                this.dragging = true;
            }
        });
        camera.scene.input.on('pointerup', (pointer) => {
            this.dragging = false;
        });

        camera.scene.input.on('pointermove', (pointer) => {
            if (this.dragging) {
                this.dragPointX2 = pointer.position.x;
                this.dragPointY2 = pointer.position.y;
            }
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

        if (this.dragging) {
            let diffX = this.dragPointX2 - this.dragPointX;
            let diffY = this.dragPointY2 - this.dragPointY;

            this.camera.scrollX += diffX * 2e-3 * delta;
            this.camera.scrollY += diffY * 2e-3 * delta;
        }
    }

    onWheelY(delta: number) {
        if (this.inputNavigation) {
            const zoomDelta = 0.05;

            let newZoom = (delta > 0) ? this.camera.zoom - zoomDelta : this.camera.zoom + zoomDelta;
            
            this.camera.zoomTo(newZoom, 40);
        }
    }
}