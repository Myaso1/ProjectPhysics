import {color, vector2} from "./modules/math.js";
import {defaultAcceleration, gravitationalConstant, ball, spring} from "./modules/physics.js";

let canvas = document.getElementById("myCanvas");
let c = canvas.getContext("2d");
let type = document.getElementById("type").dataset.type

let simulationWidth = 4;
let dt = 1 / 60;
let subSteps = 10000;
let realdt = dt / subSteps;
let steps = 0;
let bodies = [];
let simulationHeight;
let paused = false;

if (type == "oscillations") {
    var graph1 = document.getElementById("graph1");
    var g1 = graph1.getContext("2d");
    var graph2 = document.getElementById("graph2");
    var g2 = graph2.getContext("2d");
    var graph3 = document.getElementById("graph3");
    var g3 = graph3.getContext("2d");

    var slider1 = document.getElementById("slider1");
    var label1 = document.getElementById("label1");
    var slider2 = document.getElementById("slider2");
    var label2 = document.getElementById("label2");
    var slider3 = document.getElementById("slider3");
    var label3 = document.getElementById("label3");
    label1.innerHTML = "Начальная скорость тела: " + 0.01 * slider1.value;
    label2.innerHTML = "Масса тела: " + (0.3 + 0.7 * (0.005 * slider2.value + 0.5));
    label3.innerHTML = "Жесткость пружины: " + (0.3 + 0.7 * (0.005 * slider3.value + 0.5));

    for (let i = 1; i < 10; i++) {
        let line = document.createElement("div");
        line.style.position = "absolute";
        line.style.width = "2px";
        line.style.height = "10%";
        line.style.left = 10 * i + "%";
        line.style.top = "45%";
        line.style.background = "black";
        let text = document.createElement("div");
        text.style.position = "absolute";
        text.style.width = "100%";
        text.style.height = "100%";
        text.style.left = "calc(" + 10 * i + "% - 5px)";
        text.style.top = "55%";
        text.style.fontSize = "30px"
        text.innerHTML = i;
        let text2 = text.cloneNode();
        text2.innerHTML = i;
        let text3 = text.cloneNode();
        text3.innerHTML = i;

        graph1.parentElement.appendChild(line.cloneNode());
        graph1.parentElement.appendChild(text);
        graph2.parentElement.appendChild(line.cloneNode());
        graph2.parentElement.appendChild(text2);
        graph3.parentElement.appendChild(line);
        graph3.parentElement.appendChild(text3);
    }

    var positionList = [];
    var velocityList = [];
    var accelerationList = [];

    let body1 = new ball(0.005, 1, false, true, new color(0, 0, 0), new vector2(0, 2));
    let body2 = new ball(0.1, 1, false, false, new color(), new vector2(2, 2), new vector2(1, 0));
    bodies.push(body1, body2, new spring(1, body1, body2));

    slider1.oninput = function() {
        label1.innerHTML = "Начальная скорость тела: " + 0.01 * this.value;
        bodies[1].velocity = new vector2(0.01 * this.value, 0);
        bodies[1].position = new vector2(2, 2);
        positionList = [];
        velocityList = [];
        accelerationList = [];
        steps = 0;
        paused = true;
    }
    slider2.oninput = function() {
        label2.innerHTML = "Масса тела: " + (0.3 + 0.7 * (0.005 * this.value + 0.5));
        bodies[1].mass = 0.3 + 0.7 * (0.005 * this.value + 0.5);
        bodies[1].velocity = new vector2(0.01 * slider1.value, 0);
        bodies[1].position = new vector2(2, 2);
        positionList = [];
        velocityList = [];
        accelerationList = [];
        steps = 0;
        paused = true;
    }
    slider3.oninput = function() {
        label3.innerHTML = "Жесткость пружины: " + (0.3 + 0.7 * (0.005 * this.value + 0.5));
        bodies[2].stiffness = 0.3 + 0.7 * (0.005 * this.value + 0.5);
        bodies[1].velocity = new vector2(0.01 * slider1.value, 0);
        bodies[1].position = new vector2(2, 2);
        positionList = [];
        velocityList = [];
        accelerationList = [];
        steps = 0;
        paused = true;
    }
} else if (type == "conservation" || type == "conservation2") {
    simulationWidth = 2;

    var graph1 = document.getElementById("graph1");
    var g1 = graph1.getContext("2d");
    var graph2 = document.getElementById("graph2");
    var g2 = graph2.getContext("2d");

    for (let i = 1; i < 10; i++) {
        let line = document.createElement("div");
        line.style.position = "absolute";
        line.style.width = "2px";
        line.style.height = "10%";
        line.style.left = 10 * i + "%";
        line.style.top = "45%";
        line.style.background = "black";
        let text = document.createElement("div");
        text.style.position = "absolute";
        text.style.width = "100%";
        text.style.height = "100%";
        text.style.left = "calc(" + 10 * i + "% - 5px)";
        text.style.top = "55%";
        text.style.fontSize = "30px"
        text.innerHTML = i;
        let text2 = text.cloneNode();
        text2.innerHTML = i;

        graph1.parentElement.appendChild(line.cloneNode());
        graph1.parentElement.appendChild(text);
        graph2.parentElement.appendChild(line);
        graph2.parentElement.appendChild(text2);
    }

    var kineticEnergyList = [];
    var potentialEnergyList = [];

    if (type == "conservation") {
        bodies.push(new ball(0.1, 1, true, false, new color(), new vector2(1, 1)));
    } else {
        var maxEnergy = 0;
        subSteps = 100
        realdt = dt / subSteps;
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 6; y++) {
                let radius = 0.01 + 0.04 * Math.random()
                bodies.push(new ball(radius, radius ** 2, true, false, new color(), new vector2(2 * (x + 1) / 16 + 0.1 * radius, (y + 1) / 9)));
            }
        }
    }
} else if (type == "moon") {
    simulationWidth = 1.3 * 10 ** 9;
    dt *= 3600 * 24 * 30;
    realdt = dt / subSteps;

    var graph1 = document.getElementById("graph1");
    var g1 = graph1.getContext("2d");
    var graph2 = document.getElementById("graph2");
    var g2 = graph2.getContext("2d");

    for (let i = 1; i < 10; i++) {
        let line = document.createElement("div");
        line.style.position = "absolute";
        line.style.width = "2px";
        line.style.height = "10%";
        line.style.left = 10 * i + "%";
        line.style.top = "45%";
        line.style.background = "black";
        let text = document.createElement("div");
        text.style.position = "absolute";
        text.style.width = "100%";
        text.style.height = "100%";
        text.style.left = "calc(" + 10 * i + "% - 5px)";
        text.style.top = "55%";
        text.style.fontSize = "30px"
        text.innerHTML = i + "мес.";
        let text2 = text.cloneNode();
        text2.innerHTML = i + "мес.";

        graph1.parentElement.appendChild(line.cloneNode());
        graph1.parentElement.appendChild(text);
        graph2.parentElement.appendChild(line);
        graph2.parentElement.appendChild(text2);
    }

    var momentum1List = [];
    var momentum2List = [];
    
    bodies.push(new ball(0.018203 * 0.25 * simulationWidth * 10, 5.9742 * 10 ** 24, true, false, new color(0, 0, 150), new vector2(0.5 * simulationWidth, 0.3 * simulationWidth), new vector2(-13.329852, 0)));
    bodies.push(new ball(0.004964 * 0.25 * simulationWidth * 10, 7.36 * 10 ** 22, true, false, new color(255, 255, 255), new vector2(0.5 * simulationWidth, 0.025 * simulationWidth), new vector2(1082, 0)));
}

function getCanvasPosition(position) {
    return new vector2(canvas.width * position.x / simulationWidth, canvas.height * (1 - position.y / simulationHeight));
}

function onSimulationWidthUpdate() {
    simulationHeight = simulationWidth * canvas.height / canvas.width;
}

function onWindowResize() {
    if (type == "oscillations") {
        canvas.width = window.innerWidth * 0.485;
        canvas.height = window.innerHeight * 0.8;

        graph1.width = window.innerWidth * 0.485;
        graph1.height = window.innerHeight * 0.2533;

        graph2.width = window.innerWidth * 0.485;
        graph2.height = window.innerHeight * 0.2533;

        graph3.width = window.innerWidth * 0.485;
        graph3.height = window.innerHeight * 0.2533;
    } else if (type == "conservation" || type == "conservation2" || type == "moon") {
        canvas.width = window.innerWidth * 0.485;
        canvas.height = window.innerHeight * 0.8;

        graph1.width = window.innerWidth * 0.485;
        graph1.height = window.innerHeight * 0.39;

        graph2.width = window.innerWidth * 0.485;
        graph2.height = window.innerHeight * 0.39;
    }
    onSimulationWidthUpdate();
}

function render() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.lineWidth = 4;
    for (let body of bodies) {
        switch (body.type) {
            case "ball":
                let canvasPosition = getCanvasPosition(body.position);
                c.fillStyle = body.color.toString();
                c.beginPath();
                c.arc(canvasPosition.x, canvasPosition.y, canvas.width * body.radius / simulationWidth, 0, 2 * Math.PI);
                c.closePath();
                c.fill();
                break;
            case "spring":
                let difference = body.body2.position.subtract(body.body1.position);
                let length = body.length / simulationWidth;
                let tip = 0.01;
                let n = Math.floor(0.5 * length / tip);

                let cpos1 = getCanvasPosition(body.body1.position);
                let cpos2 = getCanvasPosition(body.body2.position);
                c.beginPath();
                c.moveTo(cpos1.x, cpos1.y);
                for (let k = -2 * n; k <= 2 * n; k++) {
                    let posn = body.body1.position.add(
                        difference.multiply((k * Math.min(1, 3 * tip / length) + 3) / 6)
                    ).add(
                        difference.divide(simulationWidth).rotate90().unit().multiply(
                            2 * tip * simulationWidth * Math.sin(Math.PI * k / 2)
                        )
                    );
                    let cposn = getCanvasPosition(posn);
                    c.lineTo(cposn.x, cposn.y);
                }
                c.lineTo(cpos2.x, cpos2.y);
                c.stroke();
                break;
        }
    }
}

function simulate() {
    paused = false;
    for (let i = 0; i < subSteps; i++) {
        if (paused) {
            break;
        }
        for (let body of bodies) {
            if (body.collided) {
                body.possibleCollisions = [];
                body.collided = false;
            }
            if (body.immovable) {
                continue;
            }
            let acceleration;
            if (type == "moon") {
                acceleration = new vector2();
                for (let body1 of bodies) {
                    if (body != body1) {
                        let r = body1.position.subtract(body.position);
                        acceleration = acceleration.add(
                            r.multiply(gravitationalConstant * body1.mass / r.magnitude() ** 3)
                        );
                    }
                }
            } else {
                if (type == "oscillations") {
                    acceleration = new vector2();
                } else {
                    acceleration = defaultAcceleration;
                }
                if (body.calculateAcceleration) {
                    acceleration = acceleration.add(body.calculateAcceleration());
                }
            }
            body.acceleration = acceleration;
        }

        let collidables = [];
        for (let body of bodies) {
            if (body.canCollide) {
                collidables.push(body);
            }
        }
        
        for (let i = 0; i < collidables.length; i++) {
            for(let j = i + 1; j < collidables.length; j++) {
                let body1 = collidables[i];
                let body2 = collidables[j];
                let difference = body1.position.subtract(body2.position);
                let squaredDistance = difference.dotSelf();
                if (
                    (body1.radius + body2.radius) * Math.sqrt(squaredDistance) > squaredDistance +
                    difference.dot(body1.velocity.subtract(body2.velocity)) * realdt +
                    0.5 * difference.dot(body1.acceleration.subtract(body2.acceleration)) * realdt ** 2
                ) {
                    body1.possibleCollisions.push(body2);
                }
            }
        }
        
        for (let body of bodies) {
            if (
                body.position && !body.immovable && !body.collided &&
                !(body.canCollide && body.collision(simulationWidth, simulationHeight, realdt, bodies))
            ) {
                body.position = body.position.add(
                    body.velocity.multiply(realdt)).add(body.acceleration.multiply(0.5 * realdt ** 2)
                );
                body.velocity = body.velocity.add(body.acceleration.multiply(realdt));
            }
        }
        
        for (let body of bodies) {
            if (body.position && !body.immovable && body.canCollide) {
                body.fix(simulationWidth, simulationHeight, bodies);
            }
        }
    }
    steps += 1;
}

onWindowResize();
addEventListener("resize", onWindowResize);

function update() {
    simulate();
    render();
    
    if (type == "oscillations" ) {
        if ((steps - 1) * dt <= 10) {
            positionList.push(bodies[1].position.x);
            velocityList.push(bodies[1].velocity.x);
            accelerationList.push(bodies[1].acceleration.x);
        }
        if (steps > 1) {
            g1.clearRect(0, 0, graph1.width, graph1.height);
            g1.lineWidth = 4;
            g1.beginPath();
            g1.moveTo(0, 0.5 * graph1.height * (1 - 0.5 * (positionList[0] - 2)));
            
            g2.clearRect(0, 0, graph2.width, graph2.height);
            g2.lineWidth = 4;
            g2.beginPath();
            g2.moveTo(0, 0.5 * graph2.height * (1 - 0.5 * velocityList[0]));
            
            g3.clearRect(0, 0, graph3.width, graph3.height);
            g3.lineWidth = 4;
            g3.beginPath();
            g3.moveTo(0, 0.5 * graph3.height * (1 - 0.5 * accelerationList[0]));
            for (let i = 1; i < positionList.length; i++) {
                g1.lineTo(0.1 * graph1.width * dt * i, 0.5 * graph1.height * (1 - 0.5 * (positionList[i] - 2)));
                g2.lineTo(0.1 * graph2.width * dt * i, 0.5 * graph2.height * (1 - 0.5 * velocityList[i]));
                g3.lineTo(0.1 * graph3.width * dt * i, 0.5 * graph3.height * (1 - 0.5 * accelerationList[i]));
            }
            g1.stroke();
            g2.stroke();
            g3.stroke();   
        }   
    } else if (type == "conservation" || type == "conservation2") {
        if ((steps - 1) * dt <= 10) {
            if (type == "conservation") {
                kineticEnergyList.push(bodies[0].velocity.magnitude() ** 2 / 2);
                potentialEnergyList.push(defaultAcceleration.magnitude() * bodies[0].position.y);
            } else {
                let kineticEnergy = 0;
                let potentialEnergy = 0;
                for (let i = 0; i < bodies.length; i++) {
                    kineticEnergy += bodies[i].mass * bodies[i].velocity.magnitude() ** 2 / 2;
                    potentialEnergy += bodies[i].mass * bodies[i].position.y;
                }
                
                potentialEnergy *= defaultAcceleration.magnitude();
                maxEnergy = Math.max(maxEnergy, kineticEnergy, potentialEnergy);
                kineticEnergyList.push(kineticEnergy);
                potentialEnergyList.push(potentialEnergy);
            }
        }
        
        if (steps > 1) {
            if (type == "conservation") {
                g1.clearRect(0, 0, graph1.width, graph1.height);
                g1.lineWidth = 4;
                g1.beginPath();
                g1.moveTo(0, graph1.height * (1 - kineticEnergyList[0] / 15));
                
                g2.clearRect(0, 0, graph2.width, graph2.height);
                g2.lineWidth = 4;
                g2.beginPath();
                g2.moveTo(0, graph2.height * (1 - potentialEnergyList[0] / 15));

                for (let i = 1; i < kineticEnergyList.length; i++) {
                    g1.lineTo(0.1 * graph1.width * dt * i, graph1.height * (1 - kineticEnergyList[i] / 15));
                    g2.lineTo(0.1 * graph2.width * dt * i, graph2.height * (1 - potentialEnergyList[i] / 15));
                }
            } else {
                g1.clearRect(0, 0, graph1.width, graph1.height);
                g1.lineWidth = 4;
                g1.beginPath();
                g1.moveTo(0, graph1.height * (1 - kineticEnergyList[0] / maxEnergy));
                
                g2.clearRect(0, 0, graph2.width, graph2.height);
                g2.lineWidth = 4;
                g2.beginPath();
                g2.moveTo(0, graph2.height * (1 - potentialEnergyList[0] / maxEnergy));

                for (let i = 1; i < kineticEnergyList.length; i++) {
                    g1.lineTo(0.1 * graph1.width * dt * i, graph1.height * (1 - kineticEnergyList[i] / maxEnergy));
                    g2.lineTo(0.1 * graph2.width * dt * i, graph2.height * (1 - potentialEnergyList[i] / maxEnergy));
                }
            }
            
            g1.stroke();
            g2.stroke();
        }   
    } else if (type == "moon") {
        if ((steps - 1) * dt <= 10 * 3600 * 24 * 30) {
            momentum1List.push(bodies[0].mass * bodies[0].velocity.y);
            momentum2List.push(bodies[1].mass * bodies[1].velocity.y);
        }
        
        if (steps > 1) {
            g1.clearRect(0, 0, graph1.width, graph1.height);
            g1.lineWidth = 4;
            g1.beginPath();
            g1.moveTo(0, 0.5 * graph1.height * (1 - momentum1List[0] / 10 ** 26));
            
            g2.clearRect(0, 0, graph2.width, graph2.height);
            g2.lineWidth = 4;
            g2.beginPath();
            g2.moveTo(0, 0.5 * graph2.height * (1 - momentum2List[0] / 10 ** 26));

            for (let i = 1; i < momentum1List.length; i++) {
                g1.lineTo(0.1 * graph1.width * dt * i / (3600 * 24 * 30), 0.5 * graph1.height * (1 - momentum1List[i] / 10 ** 26));
                g2.lineTo(0.1 * graph2.width * dt * i / (3600 * 24 * 30), 0.5 * graph2.height * (1 - momentum2List[i] / 10 ** 26));
            }
            g1.stroke();
            g2.stroke();
        }   
    }

    requestAnimationFrame(update);
}

update();