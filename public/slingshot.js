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

    // add bodies
    var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true }),
        rockOptions = { density: 0.004 },
        rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
        anchor = { x: 170, y: 450 },
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
        // if (mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
        //     rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
        //     World.add(engine.world, rock);
        //     elastic.bodyB = rock;
        if(!mouseconstraint && (rock.position.x > 190 || rock.position.y < 430)) {
            rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
            World.add(engine.world, rock);
            elastic.bodyB = rock;
        }
        // }
    });

    // add mouse control
    // var mouse = Mouse.create(render.canvas),
    //     mouseConstraint = MouseConstraint.create(engine, {
    //         mouse: mouse,
    //         constraint: {
    //             stiffness: 0.2,
    //             render: {
    //                 visible: false
    //             }
    //         }
    //     });
    //
    // World.add(world, mouseConstraint);
    //
    // // keep the mouse in sync with rendering
    // render.mouse = mouse;

    // custom mouse Constraint
    var mouseconstraint = null;
    canvas.addEventListener("mousedown", function(evt){
        // did the mouse down occur within the vertices of the rock?
        let mousePosition = {x: evt.offsetX, y: evt.offsetY };
        if (Matter.Vertices.contains(rock.vertices, mousePosition))
            {
            mouseconstraint = Constraint.create({
                pointA: mousePosition, // anchor
                bodyB: rock,
                pointB: {x:mousePosition.x - rock.position.x, y:mousePosition.y - rock.position.y},
                length:0,
                stiffness:0.6
                })
            World.addConstraint(engine.world, mouseconstraint);
            }
    });
    canvas.addEventListener("mousemove", function(evt){
        if(mouseconstraint){
            mouseconstraint.pointA = {x:evt.offsetX, y:evt.offsetY} // anchor
        }
    });
    canvas.addEventListener("mouseup", function(evt){
        if(mouseconstraint){
            World.remove(engine.world, mouseconstraint)
            mouseconstraint = null;
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
