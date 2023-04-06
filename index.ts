// function maxMoneyAndWays(
//     n: number,
//     roads: [number, number][],
//     money: number[]
// ): [number, number] {
//     const sums = {};

//     for (let startHouse = 1; startHouse <= n; startHouse++) {
//         let sum = 0;
//         let currHouse = startHouse;
//         const houses = new Array<boolean>(n + 1).fill(true);
//         houses[0] = false;

//         for (let [from, to] of roads) {
//             if (currHouse === from || currHouse === to) {
//                 if (houses[currHouse]) {
//                     sum += currHouse;
//                 }
//                 houses[to] = false;
//                 houses[from] = false;
//             }
//         }
//     }

//     let maxMoney = 0,
//         numWays = 1;

//     return [maxMoney, numWays];
// }

// console.log(
//     maxMoneyAndWays(
//         3,
//         [
//             [1, 2],
//             [2, 3],
//         ],
//         [6, 8, 2]
//     )
// );

// function demandingMoney(money: number[], roads: [number, number][]) {
//     /*
//      * Write your code here.
//      */
//     let adj: number[][] = [];
//     for (let road of roads) {
//         if (!adj[road[0]]) adj[road[0]] = [road[1]];
//         else adj[road[0]].push(road[1]);
//         if (!adj[road[1]]) adj[road[1]] = [road[0]];
//         else adj[road[1]].push(road[0]);
//     }
//     function visit(unvisited: number[], visited: number[] = [], bag = 0) {
//         let res = [bag];
//         for (let node of unvisited) {
//             let vis = Array.from(visited),
//                 unv: number[] = [],
//                 maxn = Math.max(-1, ...visited);
//             if (node <= maxn) continue;
//             vis.push(node);
//             for (let n of unvisited) {
//                 if (!(adj[node] && adj[node].indexOf(n) > -1) && n != node)
//                     unv.push(n);
//             }
//             let visitAll = visit(unv, vis, bag + money[node - 1]);
//             let max = Math.max(bag, ...visitAll, ...res);
//             res = res.concat(visitAll).filter((x) => x == max);
//         }
//         return res;
//     }
//     let houses = money.map((x, i) => i + 1);
//     let neighborhood = Array.from(houses);
//     for (let i = neighborhood.length - 1; i >= 0; i--) {
//         if (!adj[i + 1]) continue;
//         let minAdj = Math.min(i + 1, ...adj[i + 1]);
//         let curAdj = adj[i + 1].map((x) => neighborhood[x - 1]);
//         neighborhood = neighborhood.map((x) =>
//             curAdj.indexOf(x) > -1 ? minAdj : x
//         );
//     }
//     let nbId = Array.from(new Set(neighborhood));
//     neighborhood = nbId.map((x) =>
//         neighborhood.map((y, i) => (x == y ? i + 1 : -1)).filter((y) => y > -1)
//     );
//     console.log(neighborhood);
//     neighborhood = neighborhood.map((x) => visit(x));
//     console.log(neighborhood);
//     let max = neighborhood.reduce((p, c) => p + c[0], 0);
//     let n = neighborhood.reduce((p, c) => p * c.length, 1);
//     return [max, n];
// }

function solve(moneyInHouseArray: number[], connectedHouses) {
    const minLossCache = new Map();

    function getMinLost(housesToVisit: Set<number>) {
        if (!housesToVisit.size) {
            return [0, 1];
        }

        const housesToVisitString = JSON.stringify([...housesToVisit]);
        if (minLossCache.has(housesToVisitString)) {
            return minLossCache.get(housesToVisitString);
        }

        const nextHouseToVisit = housesToVisit.values().next().value;
        housesToVisit.delete(nextHouseToVisit);

        // Do not visit house a
        let [
            moneyLostIfNotVisitNextHouseToVisit,
            waysToGetMoneyWithoutNextHouseToVisit,
        ] = getMinLost(housesToVisit);
        moneyLostIfNotVisitNextHouseToVisit +=
            moneyInHouseArray[nextHouseToVisit];

        // Visit house a
        const housesThatWeWillNotVisit = new Set(
            [...connectedHouses[nextHouseToVisit]].filter((b) =>
                housesToVisit.has(b)
            )
        );
        const lostMoney = Array.from(housesThatWeWillNotVisit).reduce(
            (sum, b) => sum + moneyInHouseArray[b],
            0
        );
        let [
            moneyLostIfVisitNextHouseToVisit,
            waysToGetMoneyIfNextHouseToVisit,
        ] = getMinLost(
            new Set(
                [...housesToVisit].filter(
                    (b) => !housesThatWeWillNotVisit.has(b)
                )
            )
        );
        moneyLostIfVisitNextHouseToVisit += lostMoney;
        housesToVisit.add(nextHouseToVisit);

        if (
            moneyLostIfVisitNextHouseToVisit <
            moneyLostIfNotVisitNextHouseToVisit
        ) {
            [
                moneyLostIfNotVisitNextHouseToVisit,
                waysToGetMoneyWithoutNextHouseToVisit,
            ] = [
                moneyLostIfVisitNextHouseToVisit,
                waysToGetMoneyIfNextHouseToVisit,
            ];
        } else if (
            moneyLostIfVisitNextHouseToVisit ===
            moneyLostIfNotVisitNextHouseToVisit
        ) {
            waysToGetMoneyWithoutNextHouseToVisit +=
                waysToGetMoneyIfNextHouseToVisit;
        }

        minLossCache.set(housesToVisitString, [
            moneyLostIfNotVisitNextHouseToVisit,
            waysToGetMoneyWithoutNextHouseToVisit,
        ]);
        return minLossCache.get(housesToVisitString);
    }

    const [minimalLoss, number] = getMinLost(
        new Set(Array.from(moneyInHouseArray.keys()))
    );
    return [
        moneyInHouseArray.reduce((sum, x) => sum + x) - minimalLoss,
        number,
    ];
}

function demandingMoney(money, roads) {
    // Write your code here
    const G = new Array(money.length).fill().map(() => new Set());

    for (let i = 0; i < roads.length; i++) {
        const [a, b] = roads[i].map((x) => parseInt(x));
        G[a - 1].add(b - 1);
        G[b - 1].add(a - 1);
    }

    return solve(money, G);
}
