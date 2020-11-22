
/// A large circular space object of significant weight
export default interface SpaceThing {
    id: string;
    textureId?: string;
    x: number;
    y: number;
    /// the size of the radius of the object
    size: number;
    mass: number;
}
