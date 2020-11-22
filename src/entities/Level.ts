import SpaceThing from "./SpaceThing";

export default interface Level {
    comment?: string;
    /// the boundaries of the level: left, top, right, bottom
    bounds: {
        left: number,
        top: number,
        right: number,
        bottom: number,
    },
    camera?: {
        x?: number,
        y?: number,
        zoom?: number,
        minZoom?: number,
        maxZoom?: number,
    },
    lifePlanets: {
        id: string,
        textureId?: string,
        x: number,
        y: number,
        power?: number,
        size?: number,
        mass?: number,
    }[];
    things: SpaceThing[];
}
