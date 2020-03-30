var Example = Example || {};

Example.slingshot = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        canvas:canvas,
        options: {
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    const numOldRocks = 2;  // max old rocks to keep around
    const rockSides = 8, rockRadius = 20;
    var mouseconstraint = null; // the mouse constraint when there is one
    var rockDir = null;         // the direction of the mouse when the mouseconstaint is released.
    var rocks = [];             // old rocks, limited by numOldRocks
    // add bodies
    var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true }),
        rockOptions = { density: 0.004 },
        anchor = { x: 170, y: 450 },
        rock = Bodies.polygon(anchor.x, anchor.y, rockSides, rockRadius, rockOptions),
        elastic = Constraint.create({
            pointA: anchor,
            bodyB: rock,
            stiffness: 0.05
        });

    var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 25, 40);
    });

    var ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true });

    var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 25, 40);
    });

    World.add(engine.world, [ground, pyramid, ground2, pyramid2, rock, elastic]);

    Events.on(engine, 'afterUpdate', function() {
    // If the rock has been released from the mouseconstraint,
    // is it time to release the rock from the anchor restraint?
        if(!mouseconstraint && rockDir) {
            if((rockDir.x > 0 && rockDir.y < 0 && // towards upper right
                    (rock.position.x > anchor.x+rockRadius || rock.position.y < anchor.y-rockRadius))
                ||
            (rockDir.x > 0 && rockDir.y > 0 && // towards lower right
                    (rock.position.x > anchor.x+rockRadius || rock.position.y > anchor.y+rockRadius))
                ||
            (rockDir.x < 0 && rockDir.y > 0 && // towards lower left
                    (rock.position.x < anchor.x-rockRadius || rock.position.y > anchor.y+rockRadius))
                ||
            (rockDir.x < 0 && rockDir.y < 0 && // towards upper left
                    (rock.position.x < anchor.x-rockRadius || rock.position.y < anchor.y-rockRadius))

            ) { // release the rock from the anchor constraint
            rocks.push(rock);
            // create a new rock to take its place
            rock = Bodies.polygon(anchor.x, anchor.y, rockSides, rockRadius, rockOptions);
            World.add(engine.world, rock);  // add new rock to world
            elastic.bodyB = rock;   // attach new rock to anchor constraint
            if(rocks.length > numOldRocks) {
                let oldRock = rocks.shift();    // delete the oldest rock in the queue
                World.remove(engine.world, oldRock);
                }
            }
        }
        // }
    });

    // custom mouse Constraint
    canvas.addEventListener("mousedown", function(evt){
        // did the mouse down occur within the vertices of the rock?
        let mousePosition = {x: evt.offsetX, y: evt.offsetY };
        // Did the mousedown hit the rock?
        if (Matter.Vertices.contains(rock.vertices, mousePosition))
            {
            // If a mouseup event occurred when the mouse location was outside the
            // canvas, that event would be missed and there could be a stale
            // mouse constraint left hanging around.
            if(mouseconstraint)
                World.remove(engine.world, mouseconstraint);  // Also send message to server

            mouseconstraint = Constraint.create({
                pointA: mousePosition, // anchor
                bodyB: rock,
                pointB: {x:mousePosition.x - rock.position.x, y:mousePosition.y - rock.position.y},
                length:0,
                stiffness:0.6
                })
            World.addConstraint(engine.world, mouseconstraint);
            // send a message to the server that this player has a new
            // mouseconstraint
            }
    });
    // If the mouse moved when there is a mouseconstraint, move the mouseconstraint
    canvas.addEventListener("mousemove", function(evt){
        if(mouseconstraint){
            mouseconstraint.pointA = {x:evt.offsetX, y:evt.offsetY} // anchor
            // send a message to the server that the mouseconstraint for this
            // player has moved.
        }
    });
    // If the mouse button is released when there is mouseconstraint,
    // remove the mouse constraint
    canvas.addEventListener("mouseup", function(evt){
        if(mouseconstraint){
            // dispose of the mouseconstraint that is tied to the rock
            World.remove(engine.world, mouseconstraint)
            mouseconstraint = null;
            // the 'elastic' constraint will accelerate the rock towards the anchor
            rockDir = {x: anchor.x - rock.position.x, y: anchor.y - rock.position.y};
            // send a message to the server that the mouseconstraint for this
            // player has been removed and that the rock is accelerating
            // in the rockDir direction.
        }
    });


    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};
