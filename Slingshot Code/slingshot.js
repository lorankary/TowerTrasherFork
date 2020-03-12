function Slingshot(xPos, yPos){
    this.x = xPos;
    this.y = yPos;
    // add bodies
    this.rockOptions = { density: 0.008 };
    this.rock = Bodies.polygon(this.x, this.y, 8, 20, this.rockOptions);
    rocks.push(this.rock);
    this.anchor = { x: this.x, y: this.y };
    this.elastic = Constraint.create({
            pointA: this.anchor,
            bodyB: this.rock,
            stiffness: 0.05,
            length: 20

        });
    
    World.add(engine.world, [this.rock, this.elastic]);
}

Slingshot.prototype.onRelease = function() {
    var tempVel = (Vector.sub(this.rock.position, this.anchor));
    Vector.mult(tempVel, 1);
    Body.setAngle(this.rock, this.rock.angle);
    Body.setVelocity(this.rock, tempVel);
    this.rock = Bodies.polygon(this.x, this.y, 7, 20, this.rockOptions);
    rocks.push(this.rock);
    World.add(engine.world, this.rock);
    this.elastic.bodyB = this.rock;
}