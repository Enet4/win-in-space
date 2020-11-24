import Level from "./entities/Level";
import * as random from 'random';
import * as seedrandom from 'seedrandom';
import SpaceThing from "./entities/SpaceThing";
import { DEFAULT_LIFE_PLANET_SIZE } from "./entities/LifePlanet";

const TEXTURES_AVAILABLE = [
    'planet_gamma',
    'planet_neptune',
    'Dysnomia_moon'
];

/** Generate a level for two players
 * @param size the size of the level, recommended numbers are between 850 and 2_200
 * @param numPlanets the number of planets
 */
export function generateLevel(size: number, numPlanets: number, seed?: any): Level {

    let rng = seedrandom(seed, {entropy: true});
    random.use(rng);

    // maximum power based on level size
    const power = size > 2000 ? 4 : 3;

    let wSize = size;
    let hSize = size * 0.8;
    let bounds = {
        left: -wSize,
        top: -hSize,
        right: wSize,
        bottom: hSize,
    };

    // put one life planet somewhere close to the left
    // and another one close to the right
    
    let planetPosY = random.normal(0, hSize / 4);

    let lifePlanets = [
        // player 1
        {
            id: 'player1',
            x: -wSize + 600,
            y: planetPosY(),
            size: DEFAULT_LIFE_PLANET_SIZE,
            power,
        },
        // player 2
        {
            id: 'player2',
            x: wSize - 600,
            y: planetPosY(),
            size: DEFAULT_LIFE_PLANET_SIZE,
            power,
        }
    ];

    function tooCloseTo(thing, anotherThing, extraMargin = 0): boolean {
        let diffX = thing.x - anotherThing.x;
        let diffY = thing.y - anotherThing.y;
        diffX = diffX ** 2;
        diffY = diffY ** 2;
        return (diffX + diffY) < (thing.size + anotherThing.size + extraMargin) ** 2;
    }

    let thingPosX = random.uniform(-wSize + 200, wSize - 200);
    let thingPosY = random.uniform(-hSize + 200, hSize - 200);
    let thingRadius = random.exponential(4);
    let thingMassFactor = random.uniform(0.9, 1.1);
    let thingTextureIndex = random.uniformInt(0, TEXTURES_AVAILABLE.length - 1);

    let things: SpaceThing[] = [];
    for (let i = 0; i < numPlanets; i++) {
        // generate random positions for a planet
        // in a way that does not collide with other stuff
        let nt: SpaceThing;
        let attemptsLeft = 10;
        while (attemptsLeft > 0) {
            let r = 40 + thingRadius() * 100;
            let mass = thingMassFactor() * r * r * 0.1;
            nt = {
                id: `planet${i + 1}`,
                x: thingPosX(),
                y: thingPosY(),
                size: r,
                mass,
                textureId: TEXTURES_AVAILABLE[thingTextureIndex()],
            };
            let bad = things.some((p) => tooCloseTo(nt, p))
                || lifePlanets.some((p) => tooCloseTo(nt, p, 400));
            if (!bad) {
                things.push(nt);
                break;
            }
            attemptsLeft -= 1;
        }
        if (attemptsLeft === 0) {
            console.warn(`Failed to spawn space thing #${i}`);
        }
    }

    const level = {
        bounds,
        lifePlanets,
        things,
        camera: {
            x: 0,
            y: 0,
            zoom: 0.8,
            minZoom: 0.3,
        },
        comment: "Automatically generated",
    };
    console.debug("Generated level:", level);
    return level;
}
