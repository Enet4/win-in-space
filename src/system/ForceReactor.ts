import { Projectile } from "../entities/Projectile";
import SpaceThing from "../entities/SpaceThing";

interface Bounds {
    top: number,
    left: number,
    right: number,
    bottom: number,
};

interface Body {
    x: number,
    y: number,
    velX: number,
    velY: number,
}

interface PhysicsOutcome {
    forceX: number,
    forceY: number,
    /// whether a collision occurred and if so,
    /// the id of the object it collided with
    collision?: string,
    outOfBounds: boolean,
}

export interface PhysicsReactor {
    // determine the force to apply to an object based on the given position
    apply(delta: number, target: Body): PhysicsOutcome;
}

/// The gravity constant.
const G = 1.8;

export function newPhysicsReactorFrom(things: SpaceThing[], bounds: Bounds): PhysicsReactor {
    return {
        apply(delta: number, target: Projectile) {

            // accumulate the gravitical forces of all objects
            let acc_x = 0;
            let acc_y = 0;
            let collision;

            for (let thing of things) {
                let {mass, size, x, y} = thing;
                let dx = x - target.x;
                let dy = y - target.y;
                let rSqr = (dx * dx) + (dy * dy);
                if (rSqr <= size * size) {
                    collision = thing.id;
                    continue;
                }

                let f = G * mass / rSqr;

                let r = Math.sqrt(rSqr);
                dx = dx / r * f;
                dy = dy / r * f;

                acc_x += dx;
                acc_y += dy;
            }


            let out = {
                forceX: acc_x * delta,
                forceY: acc_y * delta,
                collision,
                outOfBounds: false,
            };

            if (collision) {
                return out;
            }

            target.velX += out.forceX;
            target.velY += out.forceY;

            // use the new values to update the position
            target.x += target.velX * delta;
            target.y += target.velY * delta;

            target.image.setPosition(target.x, target.y);
            target.flare.setPosition(target.x, target.y);

            // if out of bounds
            if (target.x < bounds.left
                || target.y < bounds.top
                || target.x > bounds.right
                || target.y > bounds.bottom)
            {
                out.outOfBounds = true;
            }

            return out;
        }
    }
}
