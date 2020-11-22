import * as Phaser from 'phaser';
import Level from '../entities/Level';
import { LifePlanet, create as createLifePlanet } from '../entities/LifePlanet';
import { createProjectile, Projectile } from '../entities/Projectile';
import SmoothCameraController from '../ext/SmoothCamera';
import { localized } from '../locale';
import { PhysicsReactor, newPhysicsReactorFrom } from '../system/ForceReactor';
import HudScene from './HudScene';
import {generateLevel} from '../levelGenerator';
import TrajectoryBuilder from '../system/TrajectoryBuilder';

/// The ID of the current player (0 for the first player, 1 for the second player)
type PlayerId = number;

/// the state categories of the game
enum State {
    /// waiting a bit before it continues with the next player
    Idle,
    /// A player is taking control (see currentPlayer for the ID)
    Playing,
    /// The projectile has been fired, resolving outcome
    Projecting,
    /// The game has ended with one of the players winning
    End,
}

/// Information about the turn decision of a player.
interface TurnDecision {
    /// the absolute angle of the fire in degrees
    angle: number | undefined;
    /// the absolute projectile force
    force: number | undefined;
}

interface SpaceSceneData {
    /// how many players are actually playing
    players: number;
    /// the file name of the level to use, 'RANDOM' for a generated level
    levelName: string | 'RANDOM';
    /// If generating a random level, the generation seed
    levelSeed?: any;
}

const BACKGROUNDS = [
    'background-3907905_1920',
    'background-3908098_1920',
    'universe-2303321_1920'
];

export default class SpaceScene extends Phaser.Scene {

    // -- input controllers --

    private btnEscape: Phaser.Input.Keyboard.Key;
    private btnEnter: Phaser.Input.Keyboard.Key;
    private cameraControl: SmoothCameraController;

    // -- projectile data & logic --
    private projectile: Projectile;
    private reactor: PhysicsReactor;

    // -- HUD scene --
    private hud: HudScene;

    // -- player data & logic --
    /// the life planets controlled by players
    private lifePlanets: LifePlanet[];
    /// the angle and force by player
    private decision: TurnDecision[];
    /// the canon images by player
    private canons: Phaser.GameObjects.Image[];
    /// the line represention the angle
    private angleLine: Phaser.GameObjects.Line;
    /// whether the player is angling
    private isAngling: boolean;

    /// the paths of the last trajectory, for future rendering
    private lastTrajectory: (Phaser.Curves.Path | null)[];
    private gfxTrajectory: Phaser.GameObjects.Graphics;
    private trajectoryBuilder: TrajectoryBuilder;

    /// ID of the player currently playing
    private currentPlayer: PlayerId;
    /// game state
    private state: State;
    /// the game's level (spatial set up)
    private level: Level;
    /// the number of human players
    private numHumans: number;
    /// the round number, where 0 is before the game starts
    private numRound: number;

    /// the backdrop picked
    private background: string;

    private sndChunkyExplosion: Phaser.Sound.BaseSound;
    private sndDistantExplosion: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'SpaceScene'
        });
    }

    init(data: SpaceSceneData) {

        this.btnEscape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, true, true);
        this.btnEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true, true);

        let levelName = data.levelName || 'RANDOM';
        if (levelName === 'RANDOM') {
            this.level = generateLevel(1800, 4, data.levelSeed);
        } else {
            this.level = require(`../../assets/levels/${levelName}.json`);
        }
        this.numHumans = data.players;
    }

    preload() {
        this.background = BACKGROUNDS[(Math.random() * BACKGROUNDS.length) | 0]; 
        this.load.image(this.background, `../../assets/images/${this.background}.jpg`);
    }

    create() {
        this.sndDistantExplosion = this.sound.add('muffled-distant-explosion');
        this.sndChunkyExplosion = this.sound.add('chunky-explosion');


        // create the background scene and push it to the back
        this.scene.launch('BackgroundScene', {background: this.background});
        // move it 3 times, because magic
        this.scene.moveDown('BackgroundScene');
        this.scene.moveDown('BackgroundScene');
        this.scene.moveDown('BackgroundScene');

        // set up camera and navigation
        let { camera: cam } = this.level;
        if (cam) {
            this.cameras.main.centerOn(
                cam.x || 0,
                cam.y || 0,
            );
            this.cameras.main.setZoom(cam.minZoom || 0.15);
            if (cam.zoom) {
                this.cameras.main.zoomTo(cam.zoom, 750, 'Cubic');
            }
        }
        
        this.cameraControl = new SmoothCameraController(
            this.cameras.main,
            this.input.keyboard.createCursorKeys(),
            cam && cam.minZoom || 0.15,
            cam && cam.maxZoom || 2,
        );

        this.btnEnter.addListener('down', this.onMainButtonDown.bind(this));
        this.btnEnter.addListener('up', this.onMainButtonRelease.bind(this));
        this.btnEscape.addListener('down', this.onEscapeDown.bind(this));

        this.input.addListener('pointermove', (pointer) => {
            if (pointer.isDown && pointer.button === 0) {
                //console.debug("pointermove", pointer);
            }
            if (pointer.isDown && pointer.button === 1) {
                console.debug("pointermove w middle button", pointer);
            }
            
        });

        this.input.mouse.onMouseWheel((x, y, z) => {
            console.debug('onMouseWheel', x, y, z);
        });

        this.cameras.main.setBounds(
            this.level.bounds.left,
            this.level.bounds.top,
            this.level.bounds.right - this.level.bounds.left,
            this.level.bounds.bottom - this.level.bounds.top,
        );

        this.game.scale.on('resize', (data) => {
            // update viewport accordingly
            this.cameras.main.setViewport(0, 0, data.width, data.height);
        });

        // set up life planets, used by the players

        this.lifePlanets = this.level.lifePlanets.map((p) => (
            createLifePlanet(p.id, p.x, p.y, p.size, p.mass, p.textureId, p.power)
        ));
        this.decision = this.lifePlanets.map((planet) => ({
            angle: undefined,
            force: planet.power,
        }));
        this.lastTrajectory = this.lifePlanets.map((_) => null);
        this.trajectoryBuilder = new TrajectoryBuilder();
        this.gfxTrajectory = this.add.graphics({
            lineStyle: {
                alpha: 0.25,
                color: 0x808080,
                width: 5,
            }
        });

        this.canons = [];

        // create angling arrow
        this.angleLine = this.add.line(0, 0, 0, 0, 0, 0, 0xFF0000, 0.75);
        this.angleLine.setVisible(false);

        let index = 0;
        for (const { x, y, size, textureId } of this.lifePlanets) {
            let planetId = index;
            let img = this.add.image(x, y, textureId || 'planet_blue');
            img.setInteractive();
            img.setSize(size * 2, size * 2);
            img.setDisplaySize(size * 2, size * 2);
            let canon = this.add.image(x, y, 'canon');
            const canonSize = size * 2.75;
            canon.setSize(canonSize, canonSize);
            canon.setDisplaySize(canonSize, canonSize);
            canon.setInteractive();
            this.canons.push(canon);

            const hPointerDown = (pointer) => {
                if (this.state !== State.Playing) return;
                if (planetId === this.currentPlayer && pointer.button === 0) {
                    this.isAngling = true;
                    this.angleLine.setTo(this.currentPlanet().x, this.currentPlanet().y, pointer.worldX, pointer.worldY);
                    this.angleLine.setVisible(true);
                }
            };
            canon.addListener('pointerdown', hPointerDown);
            img.addListener('pointerdown', hPointerDown);
            index += 1;
        }

        let lastX = 0;
        let lastY = 0;
        this.input.addListener('pointerdown', (pointer) => {
            if (!this.isAngling && pointer.button === 1) {
                lastX = pointer.downX;
                lastY = pointer.downY;
            }
        });
        this.input.addListener('pointermove', (pointer) => {
            if (this.isAngling) {
                this.angleLine.setTo(this.currentPlanet().x, this.currentPlanet().y, pointer.worldX, pointer.worldY);
                let angle = Phaser.Math.Angle.Between(this.currentPlanet().x, this.currentPlanet().y, pointer.worldX, pointer.worldY);
                angle = Math.round(angle * 180 / Math.PI);
                this.canons[this.currentPlayer].setAngle(angle);
                this.hud.setDecision(angle);
            } else if (pointer.isDown && pointer.button === 1) {
                let relX = pointer.position.x - lastX;
                let relY = pointer.position.y - lastY;
                //console.debug("pointermove while middle button is pressed", relX, relY, pointer);
                // !!!
            }
        });
        this.input.addListener('pointerup', (pointer) => {
            if (this.isAngling) {
                let angle = Phaser.Math.Angle.Between(this.currentPlanet().x, this.currentPlanet().y, pointer.worldX, pointer.worldY);
                angle = Math.round(angle * 180 / Math.PI);
                console.debug("Angle fixed at:", angle);
                // save angle and show it
                this.decision[this.currentPlayer].angle = angle;
                this.hud.setDecision(angle);

                this.isAngling = false;
                this.angleLine.setVisible(false);
            }
        });

        let planets = this.level.things;

        for (const { x, y, size, textureId } of planets) {
            let planet = this.add.image(x, y, textureId || 'planet_gamma');
            // size is the radius, get the diameter
            let diameter = size * 2;
            planet.setDisplaySize(diameter, diameter);
            planet.setSize(diameter, diameter);
        }

        // create physics systems
        this.reactor = newPhysicsReactorFrom([
            ...planets,
            ...this.lifePlanets,
        ], this.level.bounds);

        // create projectile, starts invisible because it does not exist yet
        this.projectile = createProjectile(this, 0, 0, 0, 0);
        this.disableProjectile();
        this.state = State.Idle;
        this.numRound = 0;

        this.scene.launch('HudScene', {
            onFire: () => {
                console.log(`[space] onFireClick callback`);
                this.onFire();
            },
        });
        this.hud = this.scene.get('HudScene') as HudScene;

        // begin the game in a moment
        setTimeout(() => {
            this.cameras.main.zoomTo((cam && cam.zoom) || 1, 500, 'Cubic');
            this.startPlayerRound(0);
        }, 500);
    }

    update(_timeElapsed: number, delta: number) {
        //console.log("update delta=%s", delta)
        this.cameraControl.update(delta);

        if (this.projectile.image.visible) {
            let out = this.reactor.apply(delta, this.projectile);

            if (out.collision) {
                // interpret the kind of collision

                if (out.collision.startsWith('player') && out.collision !== `player${this.currentPlayer + 1}`) {
                    let pId = parseInt(out.collision.slice('player'.length)) - 1;
                    if (pId !== this.currentPlayer) {
                        
                        // TODO explode stuff
                        this.sndChunkyExplosion.play();

                        let msgKey = this.currentPlayer === 0 ? 'game.player_one' : 'game.player_two';
                        this.hud.displayMessage(`\n${localized(msgKey)}\n\n${localized('game.win')}`);
                        this.state = State.End;
                        this.explodeProjectile();
                    }
    
                } else {
                    // hit some space thing
                    this.sndDistantExplosion.play();
                    this.explodeProjectile();
                    this.state = State.Idle;
                    setTimeout(() => this.startNextPlayerRound(), 1000);
                }
            }

            if (out.outOfBounds) {
                // missed
                this.disableProjectile();
                this.state = State.Idle;
                setTimeout(this.startNextPlayerRound.bind(this), 1000);
            }

            this.trajectoryBuilder.update(delta, this.projectile);
        }
    }

    onMainButtonDown(e) {
    }

    onMainButtonRelease(e) {
        if (this.state === State.Playing && !this.isAngling) {
            this.onFire();
        } else if (this.state === State.End) {
            this.end();
        }
    }

    onEscapeDown(e) {
        console.debug(`Esc key down`);
        if (this.state === State.End) {
            this.end();
        } else {
            // prompt the player otherwise
            this.scene.launch('ReallyQuitScene', {
                onQuit: this.end.bind(this),
                onCancel: () => {
                    this.scene.resume('SpaceScene');
                }
            });
            this.scene.pause('SpaceScene');
        }
    }

    private end() {
        this.scene.stop('HudScene');
        this.scene.stop('BackgroundScene');
        this.scene.start('MenuScene');
    }

    private isHuman(playerId): boolean {
        return playerId < this.numHumans;
    }

    private startNextPlayerRound() {
        this.startPlayerRound((this.currentPlayer + 1) % this.lifePlanets.length);
    }

    private startPlayerRound(playerId: number) {
        this.currentPlayer = playerId;

        this.state = State.Playing;
        // Note: player #0 always starts first
        if (playerId === 0) {
            this.numRound += 1;
        }
        console.log(`Round ${this.numRound}: player #${playerId}`);

        // get player position, pan to it
        let planet = this.lifePlanets[playerId];

        this.cameras.main.pan(planet.x, planet.y, 800, 'Cubic');

        // do the rest of the HUD stuff only if the player is human
        if (!this.isHuman(playerId)) {
            return;
        }

        // exhibit temporary message indicating player start
        let msgKey = playerId === 0 ? 'game.player_one' : 'game.player_two';

        this.hud.displayMessage(localized(msgKey), 2000);

        // show last projectile trajectory if applicable
        let trajectory = this.lastTrajectory[this.currentPlayer];
        if (trajectory) {
            this.gfxTrajectory.clear();
            trajectory.draw(this.gfxTrajectory);
        }

        // update decision and show HUD
        let { angle, force } = this.decision[playerId];
        this.hud.setPreviousDecision(angle, force);
        if (typeof angle !== 'number') {
            angle = playerId === 0 ? 0 : 180;
            this.decision[playerId].angle = angle;
        }
        if (typeof force !== 'number') {
            force = 2;
            this.decision[playerId].force = 2;
        }
        this.hud.setDecision(angle, force);
        this.hud.show();
    }

    private currentPlanet() {
        return this.lifePlanets[this.currentPlayer];
    }

    /// enter the shot resolution phase
    private onFire() {
        if (this.state !== State.Playing) {
            console.warn("Invalid state for `onFire`");
            return;
        }

        // constant canon force factor
        const F = 0.75;

        this.state = State.Projecting;
        // create projectile entity, let it fly
        let decision = this.decision[this.currentPlayer];
        if (decision.angle === undefined || decision.force === undefined) {
            console.warn("Angle/Force not yet defined");
            return;
        }
        let sourcePlanet = this.currentPlanet();
        let ang = Phaser.Math.DegToRad(decision.angle);
        let cosAng = Math.cos(ang);
        let sinAng = Math.sin(ang);
        let sourceX = sourcePlanet.x + (sourcePlanet.size + 4) * cosAng;
        let sourceY = sourcePlanet.y + (sourcePlanet.size + 4) * sinAng;
        let fireX = cosAng * decision.force * F;
        let fireY = sinAng * decision.force * F;

        // set up the new projectile with particles and stuff
        this.projectile.x = sourceX;
        this.projectile.y = sourceY;
        this.projectile.velX = fireX;
        this.projectile.velY = fireY;
        this.projectile.image.setVisible(true);
        this.projectile.flare.setVisible(true);
        this.projectile.prtcTrail.setVisible(true);
        this.projectile.prtcTrail.start();

        // initiate trajectory path
        this.lastTrajectory[this.currentPlayer] = this.trajectoryBuilder.setUp(this.projectile);
        // clear the previous one
        this.gfxTrajectory.clear();
    }

    private explodeProjectile() {
        this.projectile.image.setVisible(false);
        this.projectile.flare.setVisible(false);
        this.projectile.prtcTrail.stop();
        this.projectile.prtcHit.setVisible(true);
        this.projectile.prtcHit.resume();
        this.projectile.prtcHit.explode(42, this.projectile.x, this.projectile.y);
        setTimeout(() => {
            this.projectile.prtcHit.active = false;
        }, 250);
    }

    private disableProjectile() {
        this.projectile.image.setVisible(false);
        this.projectile.flare.setVisible(false);
        this.projectile.prtcTrail.stop();
        this.projectile.prtcHit.setVisible(false);
    }
}

