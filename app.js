const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.post('/run-pathfinding', (req, res) => {
    const grid = req.body.grid;
    const steps = runAStar(grid);
    res.json({ steps });
});

function runAStar(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;

    const startNode = findNode(grid, 'S');
    const endNode = findNode(grid, 'E');

    const openSet = [startNode];
    const closedSet = [];
    const cameFrom = {};
    const gScore = createGrid(numRows, numCols, Infinity);
    const fScore = createGrid(numRows, numCols, Infinity);

    gScore[startNode.row][startNode.col] = 0;
    fScore[startNode.row][startNode.col] = heuristic(startNode, endNode);

    const steps = [];

    while (openSet.length > 0) {
        const current = openSet.reduce((lowest, node) => 
            fScore[node.row][node.col] < fScore[lowest.row][lowest.col] ? node : lowest
        );

        if (current.row === endNode.row && current.col === endNode.col) {
            return reconstructPath(cameFrom, current, steps);
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        const neighbors = getNeighbors(current, grid);
        neighbors.forEach(neighbor => {
            if (closedSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                return;
            }

            const tentativeGScore = gScore[current.row][current.col] + 1;

            if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                openSet.push(neighbor);
            } else if (tentativeGScore >= gScore[neighbor.row][neighbor.col]) {
                return;
            }

            cameFrom[`${neighbor.row},${neighbor.col}`] = current;
            gScore[neighbor.row][neighbor.col] = tentativeGScore;
            fScore[neighbor.row][neighbor.col] = gScore[neighbor.row][neighbor.col] + heuristic(neighbor, endNode);
        });

        steps.push(closedSet.map(node => [node.row, node.col, 'visited']));
    }

    return [];
}

function findNode(grid, type) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (grid[row][col] === type) {
                return { row, col };
            }
        }
    }
}

function getNeighbors(node, grid) {
    const { row, col } = node;
    const neighbors = [];

    if (row > 0 && grid[row - 1][col] !== 'O') neighbors.push({ row: row - 1, col });
    if (row < grid.length - 1 && grid[row + 1][col] !== 'O') neighbors.push({ row: row + 1, col });
    if (col > 0 && grid[row][col - 1] !== 'O') neighbors.push({ row, col: col - 1 });
    if (col < grid[0].length - 1 && grid[row][col + 1] !== 'O') neighbors.push({ row, col: col + 1 });

    return neighbors;
}

function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function createGrid(rows, cols, initialValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
}

function reconstructPath(cameFrom, current, steps) {
    const totalPath = [current];
    while (`${current.row},${current.col}` in cameFrom) {
        current = cameFrom[`${current.row},${current.col}`];
        totalPath.push(current);
    }
    totalPath.reverse();
    totalPath.forEach(node => {
        steps.push([[node.row, node.col, 'path']]);
    });
    return steps;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
