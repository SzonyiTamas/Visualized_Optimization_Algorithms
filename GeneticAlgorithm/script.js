"use strict";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const MAX_GENERATIONS = 1000;
const POPULATION_SIZE = 100;
const NUM_CITIES = 40;
const SELECTION_PRESSURE = 1.8;
const MUTATION_COUNT = Math.floor(POPULATION_SIZE * 0.2);
const ELITE_COUNT = Math.max(1, Math.floor(0.02 * POPULATION_SIZE));

let population = [];
let fitnessValues = [];
let cities = null;
let generation = 0;

generatePopulation(POPULATION_SIZE);
geneticAlgorithm();
render();

function generatePopulation(size) {

    if (!cities) {
        cities = [];
        for (let j = 0; j < NUM_CITIES; j++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            cities.push({ x, y });
        }
    }

    population = [];
    fitnessValues = [];
    for (let i = 0; i < size; i++) {
        const route = shuffledRange(NUM_CITIES);
        population.push(route);
        fitnessValues.push(routeFitness(route));
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const bestFitness = Math.max(...fitnessValues);
    drawCities();
    drawRoute(population[fitnessValues.indexOf(bestFitness)]);

    const bestLength = (1 / bestFitness) - 1;
    context.fillStyle = "black";
    context.font = "24px Arial";
    context.fillText(`Total route length: ${bestLength.toFixed(2)}`, 20, 30);
    context.fillText(`Generation: ${generation} / ${MAX_GENERATIONS}`, 20, 60);
}

function drawCities() {
    context.fillStyle = "black";
    for (const { x, y } of cities) {
        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI * 2);
        context.fill();
    }
}

function drawRoute(route) {
    context.beginPath();
    const first = cities[route[0]];
    context.moveTo(first.x, first.y);

    for (let j = 0; j < route.length; j++) {
        const next = cities[route[(j + 1) % route.length]];
        context.lineTo(next.x, next.y);
    }
    context.closePath();
    context.stroke();
}

function shuffledRange(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function routeFitness(route) {

    let total = 0;
    for (let i = 0; i < route.length; i++) {
        const a = cities[route[i]];
        const b = cities[route[(i + 1) % route.length]];
        total += distance(a, b);
    }
    return 1 / (1 + total);
}

function sortedIndexesByFitness(fit) {
    return [...fit.keys()].sort((a, b) => fit[b] - fit[a]);
}

function selectIndex(sortedCount, pressure) {
    const r = Math.random();
    const idx = Math.floor(Math.pow(r, pressure) * sortedCount);
    return Math.min(idx, sortedCount - 1);
}

function orderCrossover(p1, p2) {
    const n = p1.length;
    let i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (i > j) [i, j] = [j, i];

    const c1 = new Array(n).fill(-1);
    for (let k = i; k <= j; k++) c1[k] = p1[k];
    const used1 = new Set(c1.filter(v => v !== -1));
    let pos1 = 0;
    for (let k = 0; k < n; k++) {
        if (c1[k] !== -1) continue;
        while (used1.has(p2[pos1])) pos1++;
        c1[k] = p2[pos1++];
    }

    const c2 = new Array(n).fill(-1);
    for (let k = i; k <= j; k++) c2[k] = p2[k];
    const used2 = new Set(c2.filter(v => v !== -1));
    let pos2 = 0;
    for (let k = 0; k < n; k++) {
        if (c2[k] !== -1) continue;
        while (used2.has(p1[pos2])) pos2++;
        c2[k] = p1[pos2++];
    }

    return [c1, c2];
}

function mutate(route) {
    const n = route.length;

    let i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (i > j) [i, j] = [j, i];

    const out = route.slice();
    while (i < j) {
        [out[i], out[j]] = [out[j], out[i]];
        i++; j--;
    }
    return out;
}

function applyMutation() {
    for (let m = 0; m < MUTATION_COUNT; m++) {
        const idx = ELITE_COUNT + Math.floor(Math.random() * (POPULATION_SIZE - ELITE_COUNT));
        population[idx] = mutate(population[idx]);
    }
    fitnessValues = population.map(routeFitness);
}

function crossover() {
    const order = sortedIndexesByFitness(fitnessValues);
    const sortedPop = order.map(i => population[i]);

    const next = sortedPop.slice(0, ELITE_COUNT).map(r => r.slice());

    while (next.length < POPULATION_SIZE) {
        const i1 = selectIndex(sortedPop.length, SELECTION_PRESSURE);
        let i2 = selectIndex(sortedPop.length, SELECTION_PRESSURE);
        if (i1 === i2) i2 = (i2 + 1) % sortedPop.length;

        const [c1, c2] = orderCrossover(sortedPop[i1], sortedPop[i2]);

        next.push(c1);
        if (next.length < POPULATION_SIZE) next.push(c2);
    }

    population = next;
    fitnessValues = population.map(routeFitness);
}

function geneticAlgorithm() {
    const timer = setInterval(() => {
        if (generation >= MAX_GENERATIONS) {
            clearInterval(timer);
            return;
        }
        crossover();
        applyMutation();
        generation++;
        render();
    }, 100);
}
