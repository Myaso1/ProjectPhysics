function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

function clampS(number, m1, m2) {
    return clamp(number, Math.min(m1, m2), Math.max(m1, m2));
}

class color {
    constructor(r = 255, g = 0, b = 0) {
        this.r = clamp(r, 0, 255);
        this.g = clamp(g, 0, 255);
        this.b = clamp(b, 0, 255);
    }
    toString() {
        return "rgb(" + this.r.toFixed(2) + "," + this.g.toFixed(2) + "," + this.b.toFixed(2) + ")";
    }
}

function solveQuadratic(a, b, c, returnAllRoots = false) {
    if (a == 0) {
        return [-c / b]
    }
    let A = a;
    a = b / A;
    b = c / A;
    let m = -0.5 * a
    let D = m ** 2 - b;
    if (D < 0) {
        return [];
    } else if (D == 0) {
        if (returnAllRoots) {
            return [m, m];
        } else {
            return [m];
        }
    } else {
        return [m - Math.sqrt(D), m + Math.sqrt(D)]
    }
}

function solveCubic(a, b, c, d, returnAllRoots = false) {
    if (a == 0) {
        return solveQuadratic(b, c, d, returnAllRoots)
    }
    let A = a;
    a = b / A;
    b = c / A;
    c = d / A;
    let p = 3 * b - a ** 2;
    let q = -(a ** 3) + 4.5 * a * b - 13.5 * c;
    if (p == 0 && q == 0) {
        let root = a / -3;
        if (returnAllRoots) {
            return [root, root, root];
        } else {
            return [root];
        }
    }
    let D = p ** 3 + q ** 2;
    if (D > 0) {
        return [((Math.cbrt(q + Math.sqrt(D)) + Math.cbrt(q - Math.sqrt(D))) - a) / 3];
    }
    let P = Math.sqrt(-p);
    let S = Math.acos(q * P ** -3);
    let roots = [(2 * P * Math.cos(S / 3) - a) / 3, (2 * P * Math.cos((S + 2 * Math.PI) / 3) - a) / 3, (2 * P * Math.cos((S + 4 * Math.PI) / 3) - a) / 3]
    if (returnAllRoots || D < 0) {
        return roots;
    } else {
        if (Math.abs(roots[0] - roots[1]) < Math.abs(roots[1] - roots[2])) {
            return [roots[1], roots[2]];
        } else {
            return [roots[0], roots[1]];
        }
    }
}

function solveQuartic(a, b, c, d, e) {
    if (a == 0) {
        return solveCubic(b, c, d, e)
    }
    let A = a;
    a = b / A;
    b = c / A;
    c = d / A;
    d = e / A;
    let D = 256 * d ** 3 - 192 * a * c * d ** 2 - 128 * b ** 2 * d ** 2 + 144 * b * c ** 2 * d - 27 * c ** 4 + 144 * a ** 2 * b * d ** 2 - 6 * a ** 2 * c ** 2 * d - 80 * a * b ** 2 * c * d + 18 * a * b * c ** 3 + 16 * b ** 4 * d - 4 * b ** 3 * c ** 2 - 27 * a ** 4 * d ** 2 + 18 * a ** 3 * b * c * d - 4 * a ** 3 * c ** 3 - 4 * a ** 2 * b ** 3 * d + a ** 2 * b ** 2 * c ** 2;
    let P = 8 * b - 3 * a ** 2;
    let O = 64 * d - 16 * b ** 2 + 16 * a ** 2 * b - 16 * a * c - 3 * a ** 4;
    let R = a ** 3 + 8 * c - 4 * a * b;
    if (D > 0 && (P > 0 || O > 0) || D == 0 && O == 0 && R == 0 && P > 0) {
        return [];
    }
    let extrema = solveCubic(4, 3 * a, 2 * b, c, true);
    extrema.sort(function(x1, x2) {
        return x1 ** 4 - x2 ** 4 + a * (x1 ** 3 - x2 ** 3) + b * (x1 ** 2 - x2 ** 2) + c * (x1 - x2);
    });
    let m = 2 * Math.sign(extrema[0] + 0.25 * a) * Math.max(1, Math.abs(a), Math.abs(b) ** 0.5, Math.abs(c) ** (1 / 3), Math.abs(d) ** 0.25);
    while (true) {
        let prevM = m;
        m = m - (m ** 4 + a * m ** 3 + b * m ** 2 + c * m + d) / (4 * m ** 3 + 3 * a * m ** 2 + 2 * b * m + c);
        if (Math.abs(m / prevM - 1) < 0.00001) {
            break;
        }
    }
    let roots = solveCubic(1, a + m, b + m * (a + m), c + m * (b + m * (a + m)));
    roots.push(m);
    return roots;
}

class vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new vector2 (this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new vector2 (this.x - vector.x, this.y - vector.y);
    }
    multiply(number) {
        return new vector2 (this.x * number, this.y * number);
    }
    divide(number) {
        return new vector2 (this.x / number, this.y / number);
    }
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    dotSelf() {
        return this.dot(this);
    }
    clampX(min, max) {
        return new vector2 (clampS(this.x, min, max), this.y);
    }
    clampY(min, max) {
        return new vector2 (this.x, clampS(this.y, min, max));
    }
    negateX() {
        return new vector2 (-this.x, this.y);
    }
    negateY() {
        return new vector2 (this.x, -this.y);
    }
    rotate90() {
        return new vector2 (-this.y, this.x);
    }
    magnitude() {
        return Math.sqrt(this.dotSelf());
    }
    distanceTo(vector) {
        return this.subtract(vector).magnitude();
    }
    unit() {
        return this.divide(this.magnitude());
    }
}

export {clamp, clampS, solveQuadratic, solveCubic, solveQuartic, color, vector2};