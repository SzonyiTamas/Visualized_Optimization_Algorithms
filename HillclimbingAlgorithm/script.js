"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


class Point {
    constructor(a, b) {
        this.x = a;
        this.y = b;
    }
}

const center = new Point(canvas.width / 2, canvas.height / 2);

const plotPoints = (pts, radius = 6) => {
    for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
};

const strokePolygon = (poly) => {
    for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        ctx.beginPath();
        ctx.moveTo(poly[i].x, poly[i].y);
        ctx.lineTo(poly[j].x, poly[j].y);
        ctx.stroke();
    }
};

function drawPointsWithColor(points, color) {
    ctx.fillStyle = color;
    plotPoints(points);
}


const toCanvas = (poly, targets, origin) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPointsWithColor(poly, "blue");
    drawPointsWithColor(origin, "black");
    drawPointsWithColor(targets, "green");

    strokePolygon(poly);

    const perim = perimeter(poly);
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`Perimeter: ${perim.toFixed(2)}`, 20, 30);
};

const isInside = (poly, p) => {
    const n = poly.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const pv = vector(poly[i], p);
        const e = vector(poly[i], poly[j]);
        if (cross2(e, pv) < 0) return false;
    }
    return true;
};

const makeCloud = (targets, poly, center, radius, count) => {
    while (targets.length < count) {
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * radius;
        const x = center.x + r * Math.cos(angle);
        const y = center.y + r * Math.sin(angle);
        const candidate = new Point(x, y);

        if (isInside(poly, candidate)) {
            targets.push(candidate);
        }
    }
};

function makeConvexPolygon(poly, center, radius, n) {
    const angles = Array.from({ length: n }, () => Math.random() * 2 * Math.PI)
        .sort((a, b) => a - b);
    for (const a of angles) {
        poly.push(new Point(
            center.x + radius * Math.cos(a),
            center.y + radius * Math.sin(a)
        ));
    }
}

const cross2 = (edge, pvec) => edge[0] * pvec[1] - edge[1] * pvec[0];

const distance = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

const vector = (p, q) => [q.x - p.x, q.y - p.y];

const perimeter = (poly) => {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        s += distance(poly[i], poly[j]);
    }
    return s;
};

const fitness = (poly, targets) => {
    let total = 0;
    const n = poly.length;

    for (let i = 0; i < n; i++) {
        const i2 = (i + 1) % n;
        const e = vector(poly[i], poly[i2]);

        for (let j = 0; j < targets.length; j++) {
            const pv = vector(poly[i], targets[j]);
            const c = cross2(e, pv);
            if (c < 0) return Infinity;
            total += c;
        }
    }
    return total;
};


async function stochasticClimb(maxIters, poly, targets, origin, stepSize) {
    let bestFitness = fitness(poly, targets);
    let bestPerim = perimeter(poly);

    const startCheckIter = 9000;
    const checkInterval = 1000;
    const improvementThreshold = 0.001;
    let lastBestPerim = bestPerim;

    for (let k = 0; k < maxIters; k++) {
        const idx = Math.floor(Math.random() * poly.length);
        const current = poly[idx];
        const backup = new Point(current.x, current.y);

        current.x += Math.round((Math.random() - 0.5) * stepSize);
        current.y += Math.round((Math.random() - 0.5) * stepSize);

        const s = fitness(poly, targets);
        const per = perimeter(poly);
        const EPS = 1e-6;

        if (Number.isFinite(s) && (per < bestPerim - EPS || (Math.abs(per - bestPerim) <= EPS && s <= bestFitness))) {
            bestFitness = s;
            bestPerim = per;
            toCanvas(poly, targets, origin);
            await new Promise((r) => setTimeout(r, 150));
        } else {
            poly[idx] = backup;
        }

        if (k >= startCheckIter && k % checkInterval === 0) {
            const improvement = lastBestPerim - bestPerim;
            if (improvement < improvementThreshold) {
                console.log(`Stopping: improvement ${improvement.toFixed(6)} < ${improvementThreshold}`);
                break;
            }
            lastBestPerim = bestPerim;
        }
    }

}


const targets = [];
const poly = [];
const STEP_SIZE = 62;
const MAX_ITERS = 11000;
const NUM_TARGETS = 10;
const origin = [center];

makeConvexPolygon(poly, center, 450, 6);
makeCloud(targets, poly, center, 220, NUM_TARGETS);

toCanvas(poly, targets, origin);
stochasticClimb(MAX_ITERS, poly, targets, origin, STEP_SIZE);
