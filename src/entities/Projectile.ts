
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
    const particlesTrail = scene.add.particles('tiny-star');
    const particlesHit = scene.add.particles('tiny-star');

    const image = scene.add.image(x, y, 'bullet168');
    const flare = scene.add.image(x, y, 'flare')
        .setAlpha(0.75)
        .setBlendMode(Phaser.BlendModes.ADD);
    const prtcTrail = particlesTrail.createEmitter({
        follow: image,
        frequency: 20,
        lifespan: 2000,
        alpha: 0.75,
    });
    prtcTrail.stop();
    const prtcHit = particlesHit.createEmitter({
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
