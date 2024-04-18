import {clamp, solveQuadratic, color, vector2, solveQuartic} from "./math.js";

let defaultAcceleration = new vector2(0, -10);
let gravitationalConstant = 6.6743 * 10 ** -11;

class ball {
    type = "ball";
    connections = [];
    constructor(radius, mass, canCollide, immovable, bodyColor = new color(), position = new vector2(), velocity = new vector2()) {
        this.radius = radius;
        this.mass = mass;
        this.canCollide = canCollide;
        this.immovable = immovable;
        this.color = bodyColor;
        this.position = position;
        this.velocity = velocity;
    }
    possibleCollisions = [];
    collided = false;
    acceleration = new vector2();
    collision(simulationWidth, simulationHeight, dt, bodies) {
        for (let t of solveQuadratic(0.5 * this.acceleration.y, this.velocity.y, this.position.y - this.radius)) {
            if (0 <= t && t < dt) {
                this.position = new vector2(this.position.x + this.velocity.x * t + 0.5 * this.acceleration.x * t ** 2, this.radius).add(this.velocity.negateY().multiply(dt - t)).add(this.acceleration.multiply(0.5 * (dt - t) ** 2));
                this.velocity = (this.velocity.add(this.acceleration.multiply(t))).negateY().add(this.acceleration.multiply(dt - t));
                return true;
            }
        }
        for (let t of solveQuadratic(0.5 * this.acceleration.y, this.velocity.y, this.position.y - simulationHeight + this.radius)) {
            if (0 <= t && t < dt) {
                this.position = new vector2(this.position.x + this.velocity.x * t + 0.5 * this.acceleration.x * t ** 2, simulationHeight - this.radius).add(this.velocity.negateY().multiply(dt - t)).add(this.acceleration.multiply(0.5 * (dt - t) ** 2));
                this.velocity = (this.velocity.add(this.acceleration.multiply(t))).negateY().add(this.acceleration.multiply(dt - t));
                return true;
            }
        }
        for (let t of solveQuadratic(0.5 * this.acceleration.x, this.velocity.x, this.position.x - this.radius)) {
            if (0 <= t && t < dt) {
                this.position = new vector2(this.radius, this.position.y + this.velocity.y * t + 0.5 * this.acceleration.y * t ** 2).add(this.velocity.negateX().multiply(dt - t)).add(this.acceleration.multiply(0.5 * (dt - t) ** 2));
                this.velocity = (this.velocity.add(this.acceleration.multiply(t))).negateX().add(this.acceleration.multiply(dt - t));
                return true;
            }
        }
        for (let t of solveQuadratic(0.5 * this.acceleration.x, this.velocity.x, this.position.x - simulationWidth + this.radius)) {
            if (0 <= t && t < dt) {
                this.position = new vector2(simulationWidth - this.radius, this.position.y + this.velocity.y * t + 0.5 * this.acceleration.y * t ** 2).add(this.velocity.negateX().multiply(dt - t)).add(this.acceleration.multiply(0.5 * (dt - t) ** 2));
                this.velocity = (this.velocity.add(this.acceleration.multiply(t))).negateX().add(this.acceleration.multiply(dt - t));
                return true;
            }
        }
        
        for (let body2 of this.possibleCollisions) {
            let positionDifference = this.position.subtract(body2.position);
            let velocityDifference = this.velocity.subtract(body2.velocity);
            let accelerationDifference = this.acceleration.subtract(body2.acceleration);
            let roots = solveQuartic(
                0.25 * accelerationDifference.dot(accelerationDifference),
                velocityDifference.dot(accelerationDifference),
                positionDifference.dot(accelerationDifference) + velocityDifference.dot(velocityDifference),
                2 * positionDifference.dot(velocityDifference),
                positionDifference.dot(positionDifference) - (this.radius + body2.radius) ** 2
            );
            roots.sort();
            for (let t of roots) {
                if (0 <= t && t < dt) {
                    this.collided = true;
                    body2.collided = true;
                    this.position = this.position.add(this.velocity.multiply(t)).add(this.acceleration.multiply(0.5 * t ** 2));
                    this.velocity = this.velocity.add(this.acceleration.multiply(t));
                    body2.position = body2.position.add(body2.velocity.multiply(t)).add(body2.acceleration.multiply(0.5 * t ** 2));
                    body2.velocity = body2.velocity.add(body2.acceleration.multiply(t));
                    
                    let difference = this.position.subtract(body2.position);
                    let difference2 = this.velocity.subtract(body2.velocity);
                    this.velocity = this.velocity.subtract(difference.multiply(2 * body2.mass * difference2.dot(difference) / ((this.mass + body2.mass) * difference.dot(difference))));
                    body2.velocity = body2.velocity.add(difference.multiply(2 * this.mass * difference2.dot(difference) / ((this.mass + body2.mass) * difference.dot(difference))));
                    
                    this.position = this.position.add(this.velocity.multiply(dt - t)).add(this.acceleration.multiply(0.5 * (dt - t) ** 2));
                    this.velocity = this.velocity.add(this.acceleration.multiply(dt - t));
                    body2.position = body2.position.add(body2.velocity.multiply(dt - t)).add(body2.acceleration.multiply(0.5 * (dt - t) ** 2));
                    body2.velocity = body2.velocity.add(body2.acceleration.multiply(dt - t));
                    return true;
                }
            }
        }
    }
    fix(simulationWidth, simulationHeight, bodies) {
        if (this.position.y <= this.radius) {
            this.position = new vector2(this.position.x, 2 * this.radius - this.position.y);;
            this.velocity = this.velocity.negateY();
        }
        if (this.position.y >= simulationHeight - this.radius) {
            this.position = new vector2(this.position.x, 2 * (simulationHeight - this.radius) - this.position.y);
            this.velocity = this.velocity.negateY();
        }
        if (this.position.x <= this.radius) {
            this.position = new vector2(2 * this.radius - this.position.x, this.position.y);
            this.velocity = this.velocity.negateX();
        }
        if (this.position.x >= simulationWidth - this.radius) {
            this.position = new vector2(2 * (simulationWidth - this.radius) - this.position.x, this.position.y);
            this.velocity = this.velocity.negateX();
        }
        for (let body2 of bodies) {
            if (body2.canCollide) {
                let positionDifference = this.position.subtract(body2.position);
                let squaredDistance = positionDifference.dotSelf();
                let squaredMinDistance = (this.radius + body2.radius) ** 2;
                if (body2 != this && squaredDistance < squaredMinDistance) {
                    let squaredVelocity = this.velocity.dotSelf();
                    let m = positionDifference.dot(this.velocity) / squaredVelocity;
                    let p = (squaredDistance - squaredMinDistance) / squaredVelocity;
                    let d = Math.sqrt(m ** 2 - p);
                    let s1 = m - d;
                    let s2 = m + d;
                    if (Math.abs(s1) < Math.abs(s2)) {
                        this.position = this.position.subtract(this.velocity.multiply(s1));
                    } else {
                        this.position = this.position.subtract(this.velocity.multiply(s2));
                    }
                    let velocityDifference = this.velocity.subtract(body2.velocity);
                    let scalar = 2 * velocityDifference.dot(positionDifference) / ((this.mass + body2.mass) * squaredDistance);
                    this.velocity = this.velocity.subtract(positionDifference.multiply(body2.mass * scalar));
                    body2.velocity = body2.velocity.add(positionDifference.multiply(this.mass * scalar));
                }
            }
        }
    }
    calculateAcceleration() {
        let acceleration = new vector2();
        for (let connection of this.connections) {
            switch (connection.type) {
                case "spring":
                    let body1;
                    if (connection.body1 == this) {
                        body1 = connection.body2;
                    } else {
                        body1 = connection.body1;
                    }
                    let difference = body1.position.subtract(this.position);
                    acceleration = acceleration.add(difference.unit().multiply(connection.stiffness * (difference.magnitude() - connection.length) / this.mass));
            }
        }
        return acceleration;
    }
}

class spring {
    type = "spring";
    constructor(stiffness, body1, body2) {
        this.stiffness = stiffness;
        this.body1 = body1;
        this.body2 = body2;
        this.length = body1.position.distanceTo(body2.position);
        body1.connections.push(this);
        body2.connections.push(this);
    }
    canCollide = false;
}


export {defaultAcceleration, gravitationalConstant, ball, spring};