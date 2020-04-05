var Example = Example || {};

Example.slingshot = function () {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body;


    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        canvas: canvas,
        options: {
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    const numOldRocks = 2;  // max number of old rocks to keep around
    const rockSides = 8, rockRadius = 20;

    const velScale = 7; // scale for adjusting the initial velocity of the rock projectile
    let shootingPhase = false;  // see 'beforeUpdate' event handler
    let releasedRock = null;  // significant during the shootingPhase
    let initialRockVelocity = {x: 0, y: 0};

    var mouseconstraint = null; // the mouse constraint when there is one
    var rockDir = null;         // the direction of the mouse when the mouseconstaint is released.
    var releasedRocks = [];             // old rocks, limited by numOldRocks
    // add bodies
    var ground = Bodies.rectangle(395, 600, 815, 50, {isStatic: true}),
        rockOptions = {density: 0.008},
        anchor = {x: 170, y: 450},
        rock = Bodies.polygon(anchor.x, anchor.y, rockSides, rockRadius, rockOptions),
        elastic = Constraint.create({
            pointA: anchor,
            bodyB: rock,
            stiffness: 0.05
        });

    var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function (x, y) {
        return Bodies.rectangle(x, y, 25, 40);
    });

    var ground2 = Bodies.rectangle(610, 250, 200, 20, {isStatic: true});

    var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function (x, y) {
        return Bodies.rectangle(x, y, 25, 40);
    });

    World.add(engine.world, [ground, pyramid, ground2, pyramid2, rock, elastic]);


    // When there is a mouseconstraint draw a dashed line to show the
    // projected path of the rock projectile once it has been
    // released from the mouseconstraint.
    function renderTraces(start, velocity) {
        // taken from matter.js physics calculations
        let velocityX = velocity.x;
        let velocityY = velocity.y;
        let pos = {x: start.x, y: start.y};
        let gravity = engine.world.gravity;
        let gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;
        const deltaTime = 16.666;
        let correction = 1;
        let timeScale = engine.timing.timeScale;
        let deltaTimeSquared = Math.pow(deltaTime * timeScale * rock.timeScale, 2);
        let frictionAir = 1 - rock.frictionAir * timeScale * rock.timeScale;

        Render.startViewTransform(render);
        let context = render.context;

        let tickDelta = 2;

        // update simulated world one time step
        function tick() {
            pos.x += velocityX;
            pos.y += velocityY;
            velocityY = (velocityY * frictionAir * correction) + (gravity.y * gravityScale * deltaTimeSquared);
            velocityX = velocityX * frictionAir * correction;
        }

        // render traces
        context.save();
        context.setLineDash([0, 9]);
        context.beginPath();
        context.moveTo(pos.x, pos.y);
        for (let i = 0; i < 30; i++) {
            context.lineTo(pos.x, pos.y);
            for (let j = 0; j < tickDelta; j++) tick();
        }
        context.strokeStyle = "#49919d";
        context.lineWidth = 5;
        context.lineCap = "round";
        context.stroke();
        context.restore();
        Render.endViewTransform(render);
    }

    // Handle the shootingPhase.  The shootingPhase is the time between
    // when the rock projectile has been released from the mouseconstraint
    // and when it has reached the anchor of the slingshot.
    // In the original slingshot example from matter.js, the 'elastic'
    // constraint that connects the rock to the slingshot anchor
    // propels the rock towards the anchor and overcomes the effects
    // of gravity.  That constraint accelerates the rock until the rock
    // reaches the anchor point and then the rock is released from the
    // constraint.  This example works differently.  The rock is released
    // at the same time from the anchor restraint as it is released from
    // the mouseconstraint and is given a constant and linear velocity until it
    // reaches the anchor point.  In order to keep the velocity constant and
    // linear up until that point, the effects of gravity and air friction must be negated.

    Events.on(engine, 'beforeUpdate', function () {
        if (shootingPhase) {
            //  a linear "launching" phase before rock is effected by gravity
            //  that makes traces look better

            Body.setVelocity(releasedRock, initialRockVelocity);
            // ignore gravity for time being
            let gravity = engine.world.gravity;
            let gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;
            releasedRock.force.y -= releasedRock.mass * gravity.y * gravityScale;

            // when rock has reached anchor, stop forcing velocity to
            // launch speed and let physics engine take back over
            if ((releasedRock.position.x - anchor.x) ** 2 + (releasedRock.position.y - anchor.y) ** 2 <
                (releasedRock.velocity.x * 2) ** 2 + (releasedRock.velocity.y * 2) ** 2) {
                Body.setPosition(releasedRock, anchor);
                shootingPhase = false;
                Body.setVelocity(releasedRock, initialRockVelocity);
            }
        }
    });

    // Initiate the shootingPhase if it is time to do so.
    // When there is not a mouseconstraint but
    // there is a rockDir, that indicates that the rock projectile
    // has just been released from the mouseconstraint. If the rock has
    // been pulled far enough away from the anchor point, calculate
    // an initial velocity for the rock, release it from the elastic
    // anchor resraint and begin the shootingPhase.  Create a new rock to
    // take the place of the released rock but don't add it to the physics
    // world until after a delay of 500 ms.

    Events.on(engine, 'afterUpdate', function () {
        // If the rock has been released from the mouseconstraint,
        // is it time to release the rock from the anchor restraint?
        // rockDir is a vector from the current position of the rock
        // to the anchor point.
        if (!mouseconstraint && rockDir) {
            // find the square of the distance from the rock to the anchor point.
            let distanceSq = rockDir.x ** 2 + rockDir.y ** 2;
            // if pulled far enough from the anchor point
            if (distanceSq > (rockRadius * 2) ** 2) {  // square of the diameter of the rock
                shootingPhase = true;   // initiate the shootingPhase
                releasedRock = rock;
                releasedRocks.push(releasedRock); // add to list of released rocks

                // set rocks velocity based on how far it was pulled back
                initialRockVelocity = {x: rockDir.x / velScale, y: rockDir.y / velScale};
                Body.setVelocity(releasedRock, initialRockVelocity);

                // stop rendering spring and stop it from interacting with the rock
                elastic.bodyB = null; // release the rock from the anchor constraint
                elastic.render.visible = false;

                // create a new rock to take its place
                rock = Bodies.polygon(anchor.x, anchor.y, rockSides, rockRadius, rockOptions);


                const spawnWaitDelay = 500; //ms
                setTimeout(() => {
                    World.add(engine.world, rock);  // add new rock to world
                    elastic.bodyB = rock;   // attach new rock to anchor constraint
                    elastic.render.visible = true;
                    if (releasedRocks.length > numOldRocks) {
                        let oldRock = releasedRocks.shift();    // delete the oldest rock in the queue
                        World.remove(engine.world, oldRock);    // from the queue and the physics world
                    }
                }, spawnWaitDelay);
            }
            rockDir = null;     // no longer in the pulled back but not released state
        }
    });

    // When there is a mouseconstraint, calculate a projected initial velocity
    // based on the distance of the rock from the anchor point,
    // using a scaling factor, and call renderTraces() to draw the trace
    // of the projected path of the projectile.

    Events.on(render, "afterRender", function () {
        if (mouseconstraint) {
            let offset = {x: anchor.x - rock.position.x, y: anchor.y - rock.position.y};
            let projectedRockVelocity = {x: offset.x / velScale, y: offset.y / velScale};
            renderTraces(anchor, projectedRockVelocity);
        }
    });

    // Custom mouse constraint
    // Use mousedown, mousemove and mouseup events instead of the built-in
    // matter.js mouseConstraint so that the custom mouseconstraint will
    // attach only to the rock that is attached to the anchor restraint
    // and not to any other bodies in the physics world.

    canvas.addEventListener("mousedown", function (evt) {
        // If a mouseup event occurred when the mouse location was outside the
        // canvas, that event would be missed and there could be a stale
        // mouse constraint left hanging around.
        if(mouseconstraint)
            World.remove(engine.world, mouseconstraint);

        // did the mouse down occur within the vertices of the rock?
        let mousePosition = {x: evt.offsetX, y: evt.offsetY};
        if (Matter.Vertices.contains(rock.vertices, mousePosition)) {
            mouseconstraint = Constraint.create({
                pointA: mousePosition, // anchored to the mousePosition
                bodyB: rock,
                pointB: {x: mousePosition.x - rock.position.x, y: mousePosition.y - rock.position.y},
                length: 0,
                stiffness: 0.6
            });
            World.addConstraint(engine.world, mouseconstraint);
        }
    });
    // If the mouse moved when there is a mouseconstraint, move the mouseconstraint
    canvas.addEventListener("mousemove", function (evt) {
        if (mouseconstraint) {
            let mousePosition = {x: evt.offsetX, y: evt.offsetY};
            mouseconstraint.pointA = mousePosition; // anchor to mouse
        }
    });
    // If the mouse button is released when there is mouseconstraint,
    // dispose of the mouse constraint thereby releasing the rock.
    canvas.addEventListener("mouseup", function (evt) {
        if (mouseconstraint) {
            // dispose of the mouseconstraint that is tied to the rock
            World.remove(engine.world, mouseconstraint)
            mouseconstraint = null;
            // create a global vector from the mouse position to the
            // slingshot anchor point.  'afterUpdate' will then
            // initiate the shootingPhase.
            rockDir = {x: anchor.x - rock.position.x, y: anchor.y - rock.position.y};
        }
    });


    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: {x: 0, y: 0},
        max: {x: 800, y: 600}
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};
