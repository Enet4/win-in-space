import * as Phaser from 'phaser';
import Level from '../entities/Level';
import { LifePlanet, create as createLifePlanet } from '../entities/LifePlanet';
import { createProjectile, Projectile } from '../entities/Projectile';
import SmoothCameraController from '../ext/SmoothCamera';
import { localized } from '../locale';
import { PhysicsReactor, newPhysicsReactorFrom } from '../system/ForceReactor';
import HudScene from './HudScene';
import { generateLevel } from '../levelGenerator';
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

export interface Statistics {
    /// the longest flying time of a projectile
    longestLiving: number;
    /// ID of the player that fired the longest flying projectile
    longestLivingPlayerId: PlayerId | null;
    /// the round number, where 0 is before the game starts
    numRound: number;
    /// the force applied in the final shot
    powerLastShot?: number;
    /// whether the shot destroyed the shooter
    selfDestruct?: boolean;
}

const BACKGROUNDS = [
    'background-3907905_1920',
    'background-3908098_1920',
    'universe-2303321_1920'
];

interface LifePlanetEntity extends LifePlanet {
    img: Phaser.GameObjects.Image;
    /// the canon images by player
    canon?: Phaser.GameObjects.Image;
    /// the nation flags by player
    flag: Phaser.GameObjects.Image;
    /// the particle emitter for when the planet explodes
    explosionParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter,
    /// the angle and force by player
    decision: TurnDecision;
    /// the paths of the last trajectory, for future rendering
    lastTrajectory: Phaser.Curves.Path | null;
}

export default class SpaceScene extends Phaser.Scene {

    // -- input controllers --

    private btnEscape: Phaser.Input.Keyboard.Key;
    private btnEnter: Phaser.Input.Keyboard.Key;
    private btnPowerUp: Phaser.Input.Keyboard.Key;
    private btnPowerDown: Phaser.Input.Keyboard.Key;
    private cameraControl: SmoothCameraController;

    // -- HUD scene --
    private hud: HudScene;

    // -- player data & logic --
    /// the life planets controlled by players
    private lifePlanets: LifePlanetEntity[];
    /// the line represention the angle
    private angleLine: Phaser.GameObjects.Line;
    /// whether the player is angling
    private isAngling: boolean;

    // -- projectile data & logic --
    private projectile: Projectile;
    private reactor: PhysicsReactor;
    private projectileCreated: number;

    // graphics object for rendering trajectories
    private gfxTrajectory: Phaser.GameObjects.Graphics;
    private trajectoryBuilder: TrajectoryBuilder;
    /// whether the camera is following the projectile
    private isFollowing: boolean;

    /// ID of the player currently playing
    private currentPlayer: PlayerId;
    /// game state
    private state: State;
    /// game statistics
    private statistics: Statistics;

    /// the game's level (spatial set up)
    private level: Level;
    /// the number of human players
    private numHumans: number;

    /// the backdrop picked
    private background: string;

    /// sound resource - distant explosion
    private sndDistantExplosion: Phaser.Sound.BaseSound;
    /// sound resource - chunky explosion
    private sndChunkyExplosion: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'SpaceScene'
        });
    }

    init(data: SpaceSceneData) {

        this.btnEscape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, true);
        this.btnEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, true);
        
        this.btnPowerUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS, true);
        this.btnPowerDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS, true);

        let levelName = data.levelName || 'RANDOM';
        if (levelName === 'RANDOM') {
            this.level = generateLevel(1800, 4, data.levelSeed);
        } else {
            this.level = require(`../../data/levels/${levelName}.json`);
        }
        this.numHumans = data.players;
    }

    preload() {
        this.background = BACKGROUNDS[(Math.random() * BACKGROUNDS.length) | 0];
    }

    create() {
        this.sndDistantExplosion = this.sound.add('muffled-distant-explosion');
        this.sndChunkyExplosion = this.sound.add('chunky-explosion');


        // create the background scene and push it to the back
        this.scene.launch('BackgroundScene', { background: this.background });
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
        
        this.btnPowerUp.addListener('down', this.powerUp.bind(this));
        this.btnPowerDown.addListener('down', this.powerDown.bind(this));

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

        this.trajectoryBuilder = new TrajectoryBuilder();
        this.gfxTrajectory = this.add.graphics({
            lineStyle: {
                alpha: 0.25,
                color: 0x808080,
                width: 5,
            }
        });

        // create angling arrow
        this.angleLine = this.add.line(0, 0, 0, 0, 0, 0, 0xFF0000, 0.75);
        this.angleLine.setVisible(false);

        // set up life planets, used by the players
        this.lifePlanets = this.level.lifePlanets.map((p) => {
            const planet = createLifePlanet(p.id, p.x, p.y, p.size, p.mass, p.textureId, p.power);
            const {x, y, size, textureId} = planet;
            const playerId = parseInt(planet.id.slice('player'.length)) - 1;
            const img = this.add.image(x, y, textureId || 'planet_blue');
            img.setInteractive();
            img.setSize(size * 2, size * 2);
            img.setDisplaySize(size * 2, size * 2);
            const flagTexture = playerId === 0 ? 'flag-cyan' : 'flag-purple';
            const flag = this.add.image(x, y - 12, flagTexture);
            flag.setDisplaySize(42, 42);

            let canon: undefined | Phaser.GameObjects.Image;
            if (this.isHuman(playerId)) {
                canon = this.add.image(x, y, 'canon');
                const canonSize = size * 2.75;
                canon.setSize(canonSize, canonSize);
                canon.setDisplaySize(canonSize, canonSize);
                // if life planet is mostly to the right,
                // point canon to the other side
                if (x > this.cameras.main.centerX) {
                    canon.setRotation(Math.PI);
                }

                const hPointerDown = (pointer) => {
                    if (this.state !== State.Playing) return;
                    if (playerId === this.currentPlayer && pointer.button === 0) {
                        this.isAngling = true;
                        this.angleLine.setTo(this.currentPlanet.x, this.currentPlanet.y, pointer.worldX, pointer.worldY);
                        this.angleLine.setVisible(true);
                    }
                };
                canon.addListener('pointerdown', hPointerDown);
                img.addListener('pointerdown', hPointerDown);
            }

            const particlesHit = this.add.particles('tiny-star');
            const explosionParticleEmitter = particlesHit.createEmitter({
                active: false,
                follow: img,
                radial: true,
                speed: 180,
                lifespan: 120,
                tint: [0xCF6A00, 0xCF2800, 0xCF0000],
                scale: 2.5,
                alpha: 0.75,
            });

            return {
                ...planet,
                decision: {
                    angle: undefined,
                    force: 2,
                },
                lastTrajectory: null,
                canon,
                img,
                flag,
                explosionParticleEmitter,
            }
        });

        this.input.addListener('pointermove', (pointer) => {
            if (this.isAngling) {
                this.angleLine.setTo(this.currentPlanet.x, this.currentPlanet.y, pointer.worldX, pointer.worldY);
                let angle = Phaser.Math.Angle.Between(this.currentPlanet.x, this.currentPlanet.y, pointer.worldX, pointer.worldY);
                angle = Math.round(angle * 180 / Math.PI);
                this.currentPlanet.canon!.setAngle(angle);
                this.hud.setDecision(angle);
            }
        });
        this.input.addListener('pointerup', (pointer) => {
            if (this.isAngling) {
                let angle = Phaser.Math.Angle.Between(this.currentPlanet.x, this.currentPlanet.y, pointer.worldX, pointer.worldY);
                angle = Math.round(angle * 180 / Math.PI);
                console.debug("Angle fixed at:", angle);
                // save angle and show it
                this.currentPlanet.decision.angle = angle;
                this.hud.setDecision(angle);

                this.isAngling = false;
                this.angleLine.setVisible(false);
            }
        });

        let planets = this.level.things;

        for (const { x, y, size, textureId, mass } of planets) {
            let planet = this.add.image(x, y, textureId || 'planet_gamma');
            // size is the radius, get the diameter
            let diameter = size * 2;
            planet.setDisplaySize(diameter, diameter);
            planet.setSize(diameter, diameter);
            if (mass < 0) {
                planet.setTint(0xDF4F5F);
                planet.setRotation(Math.PI);
            }
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
        this.statistics = {
            longestLiving: 0,
            longestLivingPlayerId: null,
            numRound: 0,
        };

        this.scene.launch('HudScene', {
            onFire: () => {
                console.log(`[space] onFireClick callback`);
                this.onFire();
            },
            onPowerUp: this.powerUp.bind(this),
            onPowerDown: this.powerDown.bind(this),
        });
        this.hud = this.scene.get('HudScene') as HudScene;
        this.hud.resetPreviousDecision();

        // begin the game in a moment
        setTimeout(() => {
            this.cameras.main.zoomTo((cam && cam.zoom) || 1, 500, 'Cubic');
            this.startPlayerRound(0);
        }, 500);
    }

    update(_timeElapsed: number, delta: number) {
        this.cameraControl.update(delta);

        // increased rate for better accuracy
        const fracDelta = delta * 0.25;
        this.updateProjectile(fracDelta);
        this.updateProjectile(fracDelta);
        this.updateProjectile(fracDelta);
        this.updateProjectile(fracDelta);
    }

    updateProjectile(delta: number) {
        if (this.state !== State.Projecting || !this.projectile.image.visible) {
            return;
        }
        
        let out = this.reactor.apply(delta, this.projectile);

        if (out.collision) {
            // interpret the kind of collision

            if (out.collision.startsWith('player')) {
                let pId = parseInt(out.collision.slice('player'.length)) - 1;

                let planet = this.lifePlanets[pId];
                // explode stuff
                this.sndChunkyExplosion.play();
                planet.explosionParticleEmitter.active = true;
                const {x, y} = planet;
                const continuousExplosionH = setInterval(() => {
                    let pX = x + (Math.random() - 0.5) * 72;
                    let pY = y + (Math.random() - 0.5) * 72;
                    planet.explosionParticleEmitter.explode(42, pX, pY);
                }, 36);
                setTimeout(() => {
                    clearInterval(continuousExplosionH);
                }, 740);
                
                planet.explosionParticleEmitter.explode(128, x + 48, y);
                planet.explosionParticleEmitter.explode(128, x, y - 48);
                planet.explosionParticleEmitter.explode(128, x, y + 48);
                this.cameras.main.shake(280, 0.15);
                this.cameras.main.pan(planet.x, planet.y, 500, 'Cubic');
                planet.img.setTint(0x222222);
                planet.flag.setTintFill(0xFFFFFF);
                if (planet.canon) {
                    planet.canon.setVisible(false);
                }

                if (pId === 0 && this.numHumans === 1) {
                    // you lose
                    this.hud.displayMessage(`\n\n\n${localized('game.lose')}`, 'red');
                } else {
                    // the other player wins
                    let msgKey = pId === 0 ? 'game.player_two' : 'game.player_one';
                    this.hud.displayMessage(`\n\n\n${localized(msgKey)}\n\n${localized('game.win')}`);
                }

                this.explodeProjectile();
                this.state = State.End;

                // summary
                setTimeout(() => {
                    this.scene.launch('SummaryScene', {
                        ...this.statistics,
                        // humiliation detection
                        selfDestruct: pId === this.currentPlayer,
                        onQuit: this.end.bind(this)
                    });
                }, 750);

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

    private onMainButtonDown(e) {
    }

    private onMainButtonRelease(e) {
        if (this.state === State.Playing && !this.isAngling) {
            this.onFire();
        } else if (this.state === State.End) {
            this.end();
        }
    }

    private onEscapeDown(e) {
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

    private powerUp() {
        if (this.state === State.Playing) {
            // update power appropriately
            let decision = this.currentPlanet.decision;
            if (decision.force) {
                if (decision.force < this.lifePlanets[this.currentPlayer].power) {
                    decision.force += 1;
                    this.hud.setDecision(decision.angle, decision.force);
                }
            }
        }
    }

    private powerDown() {
        if (this.state === State.Playing) {
            // update power appropriately
            let decision = this.currentPlanet.decision;
            if (decision.force) {
                if (decision.force > 1) {
                    decision.force -= 1;
                    this.hud.setDecision(decision.angle, decision.force);
                }
            }
        }
    }

    private end() {
        this.scene.stop('HudScene');
        this.scene.stop('BackgroundScene');
        this.scene.stop('SummaryScene');

        // clean up listeners and other resources
        this.btnEnter.destroy();
        this.btnEscape.destroy();
        this.btnPowerDown.destroy();
        this.btnPowerUp.destroy();
        
        this.scene.start('MenuScene');
    }

    private isHuman(playerId: PlayerId): boolean {
        return playerId < this.numHumans;
    }

    private startNextPlayerRound() {
        // currently, the number of humans is also the number of actual players
        this.startPlayerRound((this.currentPlayer + 1) % this.numHumans);
    }

    private startPlayerRound(playerId: number) {
        this.currentPlayer = playerId;

        this.state = State.Playing;
        // Note: player #0 always starts first
        if (playerId === 0) {
            this.statistics.numRound += 1;
        }
        console.log(`Round ${this.statistics.numRound}: player #${playerId}`);

        // get player position, pan to it
        let planet = this.lifePlanets[playerId];

        this.cameras.main.pan(planet.x, planet.y, 800, 'Cubic');

        // do the rest of the HUD stuff only if the player is human
        if (!this.isHuman(playerId)) {
            return;
        }

        // exhibit temporary message indicating player start
        let msgKey = playerId === 0 ? 'game.player_one' : 'game.player_two';

        this.hud.displayMessage(localized(msgKey), undefined, 2000);

        // show last projectile trajectory if applicable
        let trajectory = this.currentPlanet.lastTrajectory;
        if (trajectory) {
            this.gfxTrajectory.clear();
            trajectory.draw(this.gfxTrajectory);
        }

        // update decision and show HUD
        let { angle, force } = this.currentPlanet.decision;
        this.hud.setPreviousDecision(angle, force);
        if (typeof angle !== 'number') {
            angle = playerId === 0 ? 0 : 180;
            this.currentPlanet.decision.angle = angle;
        }
        if (typeof force !== 'number') {
            force = 2;
            this.currentPlanet.decision.force = 2;
        }
        this.hud.setDecision(angle, force);
        this.hud.show();
    }

    private get currentPlanet() {
        return this.lifePlanets[this.currentPlayer];
    }

    /// enter the shot resolution phase
    private onFire() {
        if (this.state !== State.Playing) {
            console.warn("Invalid state for `onFire`");
            return;
        }

        // constant canon force factor
        const F = 0.78;

        this.state = State.Projecting;
        // create projectile entity, let it fly
        let decision = this.currentPlanet.decision;
        if (decision.angle === undefined || decision.force === undefined) {
            console.warn("Angle/Force not yet defined");
            return;
        }
        // tweak least power shot
        let force = Math.max(decision.force, 1.12);
        let sourcePlanet = this.currentPlanet;
        let ang = Phaser.Math.DegToRad(decision.angle);
        let cosAng = Math.cos(ang);
        let sinAng = Math.sin(ang);
        let sourceX = sourcePlanet.x + (sourcePlanet.size + 4) * cosAng;
        let sourceY = sourcePlanet.y + (sourcePlanet.size + 4) * sinAng;
        let fireX = cosAng * force * F;
        let fireY = sinAng * force * F;

        // set up the new projectile with particles and stuff
        this.projectile.x = sourceX;
        this.projectile.y = sourceY;
        // set image position too
        // to avoid emimitting particles in its last position
        this.projectile.image.x = sourceX;
        this.projectile.image.y = sourceY;
        this.projectile.velX = fireX;
        this.projectile.velY = fireY;
        this.projectile.image.setVisible(true);
        this.projectile.flare.setVisible(true);
        this.projectile.prtcTrail.setVisible(true);
        this.projectile.prtcTrail.start();

        // initiate trajectory path
        this.currentPlanet.lastTrajectory = this.trajectoryBuilder.setUp(this.projectile);
        // clear the previous one
        this.gfxTrajectory.clear();
        // play sound
        this.sound.play('bang');

        this.statistics.powerLastShot = decision.force;
        this.state = State.Projecting;
        this.projectileCreated = this.time.now;

        // start following the projectile after a few moments
        setTimeout(() => {
            if (this.state === State.Projecting && !this.isFollowing) {
                let cam = this.cameras.main;
                cam.setDeadzone(this.scale.canvas.width - 100, this.scale.canvas.height - 100);
                cam.startFollow(this.projectile.image, true, 0.5, 0.5);
                this.isFollowing = true;
            }
        }, 1200);
    }

    private explodeProjectile() {
        if (this.state === State.Projecting) {
            // update time statistics
            let cTime = this.time.now;
            if (cTime - this.projectileCreated > this.statistics.longestLiving) {
                this.statistics.longestLiving = cTime - this.projectileCreated;
                this.statistics.longestLivingPlayerId = this.currentPlayer;
            }
        }

        this.projectile.image.setVisible(false);
        this.projectile.flare.setVisible(false);
        this.projectile.prtcTrail.stop();
        this.projectile.prtcHit.setVisible(true);
        this.projectile.prtcHit.resume();
        this.projectile.prtcHit.explode(42, this.projectile.x, this.projectile.y);
        // stop following the projectile
        this.cameras.main.stopFollow();
        this.isFollowing = false;
        setTimeout(() => {
            this.projectile.prtcHit.active = false;
        }, 250);
    }

    private disableProjectile() {
        if (this.state === State.Projecting) {
            // update time statistics
            let cTime = this.time.now;
            if (cTime - this.projectileCreated > this.statistics.longestLiving) {
                this.statistics.longestLiving = cTime - this.projectileCreated;
                this.statistics.longestLivingPlayerId = this.currentPlayer;
            }
        }

        this.projectile.image.setVisible(false);
        this.projectile.flare.setVisible(false);
        this.projectile.prtcTrail.stop();
        this.projectile.prtcHit.setVisible(false);
        // stop following the projectile
        this.cameras.main.stopFollow();
        this.isFollowing = false;
    }
}

