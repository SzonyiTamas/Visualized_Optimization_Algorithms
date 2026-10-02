# Metaheuristic Optimization in JavaScript

Two browser-based simulations of classic metaheuristic optimization algorithms, written from scratch in plain JavaScript with no libraries, frameworks or build step. One solves a combinatorial problem (TSP), the other a geometric one (minimal enclosing polygon).

## Running

Open the `index.html` file in either folder in a modern browser. Each run uses a new random instance.

---

## 1. Genetic Algorithm: Travelling Salesman Problem

Places 40 random cities on a canvas and evolves a population of 100 candidate tours toward the shortest closed route. The best tour of each generation is drawn live, together with its total length.

**How it works**
- **Encoding:** each individual is a permutation of city indices, initialised with a Fisher–Yates shuffle.
- **Fitness:** `1 / (1 + tour length)`, using Euclidean distances.
- **Selection:** rank-based with tunable selection pressure. The population is sorted by fitness and parents are drawn at index `floor(r^1.8 · N)`, which biases selection toward fitter tours without discarding diversity.
- **Elitism:** the top 2% of tours are copied unchanged into the next generation.
- **Crossover:** Order Crossover (OX1), which keeps a random segment from one parent and fills the rest in the order of the other parent. Every child is a valid permutation.
- **Mutation:** segment inversion (the same move as 2-opt) applied to 20% of the population. Elite individuals are never mutated.
- **Termination:** 1000 generations, rendered every 100 ms with a live generation counter.

## 2. Stochastic Hill Climbing: Minimal Enclosing Polygon

Starts with a random convex hexagon and a cloud of 10 target points inside it. The algorithm moves the hexagon's vertices to shrink its perimeter as far as possible while every target point stays inside. The result approximates the convex hull of the point cloud.

**How it works**
- **Containment test:** uses the 2D cross product. A point is inside if it lies on the left side of every directed edge.
- **Neighbour move:** choose a random vertex and shift it by a random offset of up to ±31 px.
- **Acceptance rule:** a move is accepted only if all targets are still enclosed and the perimeter decreases. When the perimeter is unchanged, a secondary cross-product score breaks the tie. Rejected moves are rolled back.
- **Feasibility:** a move that leaves any target outside gets a fitness of `∞` and is rejected.
- **Termination:** up to 11,000 iterations. From iteration 9,000 the progress is checked every 1,000 iterations, and the run stops early if the perimeter improved by less than 0.001 since the last check.
- **Visualisation:** each accepted improvement is animated with `async`/`await`, so you can watch the polygon tighten around the points.

---

## Highlights

- Covers two algorithm families on two problem types: evolutionary search on a combinatorial problem and local search on a geometric one.
- Uses standard improvements beyond the textbook versions: elitism, a selection-pressure parameter, rollback of rejected moves and early stopping.
- Real-time visualisation with the HTML5 Canvas API.
- Runs without dependencies or a build step.

## Tech

JavaScript (ES6+), HTML5 Canvas

## Author

**Tamás Szőnyi**
