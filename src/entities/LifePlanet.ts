import SpaceThing from "./SpaceThing";

export const DEFAULT_LIFE_PLANET_SIZE = 64;
export const DEFAULT_LIFE_PLANET_MASS = 18;

export interface LifePlanet extends SpaceThing {
    power: number;
}

export function create(
    id: string,
    x: number,
    y: number,
    size: number = DEFAULT_LIFE_PLANET_SIZE,
    mass: number = DEFAULT_LIFE_PLANET_MASS,
    textureId: string = 'planet_blue',
    power: number = 2): LifePlanet 
{
    return {
        id, x, y, size, mass, textureId, power
    };
}
