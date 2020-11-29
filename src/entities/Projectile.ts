
/// An object that flies around and is influenced by other heavy objects.
export interface Projectile {
    image: Phaser.GameObjects.Image;
    flare: Phaser.GameObjects.Image;
    /// particle trail
    prtcTrail: Phaser.GameObjects.Particles.ParticleEmitter;
    /// hit partifles
    prtcHit: Phaser.GameObjects.Particles.ParticleEmitter;
    x: number;
    y: number;
    velX: number;
    velY: number;
}

export function createProjectile(scene: Phaser.Scene, x: number, y: number, velX: number, velY: number): Projectile {
    let particlesTrail = scene.add.particles('tiny-star');
    let particlesHit = scene.add.particles('tiny-star');

    let image = scene.add.image(x, y, 'bullet168');
    let flare = scene.add.image(x, y, 'flare');
    let prtcTrail = particlesTrail.createEmitter({
        follow: image,
        frequency: 20,
        lifespan: 2000,
        alpha: 0.75,
    });
    prtcTrail.stop();
    let prtcHit = particlesHit.createEmitter({
        active: false,
        follow: image,
        radial: true,
        speed: 120,
        lifespan: 150,
        tint: [0xCF6A00, 0xCF2800, 0xCF0000],
    });
    return {
        image,
        flare,
        prtcTrail,
        prtcHit,
        x,
        y,
        velX,
        velY,
    };
}
