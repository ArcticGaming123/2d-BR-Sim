const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game;
let players = [];
let playerData = [];
let simulationActive = false;
let numPlayers = 8;
let mapChoice = 'small';

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('map-small', 'assets/map-small.png');
    this.load.image('map-medium', 'assets/map-medium.png');
    this.load.image('map-big', 'assets/map-big.png');
}

function create() {
    // Wait for user to click start
    document.getElementById('startBtn').onclick = () => {
        numPlayers = parseInt(document.getElementById('numPlayers').value);
        mapChoice = document.getElementById('mapSize').value;

        document.getElementById('menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        startSimulation(this);
    };
}

function startSimulation(scene) {
    simulationActive = true;

    // Add map background
    scene.add.image(400, 300, `map-${mapChoice}`);

    // Create players
    players = [];
    playerData = [];
    for (let i = 0; i < numPlayers; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        let player = scene.add.sprite(x, y, 'player');
        player.health = 100;
        player.name = 'Player ' + (i + 1);
        players.push(player);

        playerData.push({
            name: player.name,
            kills: 0,
            alive: true,
            place: null
        });
    }
}

function update() {
    if (!simulationActive) return;

    // Simple CPU movement and combat
    players.forEach(player => {
        if (player.health <= 0) return;

        // Move randomly
        player.x += Phaser.Math.Between(-1, 1);
        player.y += Phaser.Math.Between(-1, 1);
        player.x = Phaser.Math.Clamp(player.x, 0, 800);
        player.y = Phaser.Math.Clamp(player.y, 0, 600);

        // Check for attacks on other players
        players.forEach(target => {
            if (target === player || target.health <= 0) return;
            let distance = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
            if (distance < 30) { // attack range
                target.health -= 1; // damage per tick
                if (target.health <= 0) {
                    // Register kill
                    let killer = playerData.find(p => p.name === player.name);
                    killer.kills += 1;

                    // Register placement
                    let deadPlayer = playerData.find(p => p.name === target.name);
                    deadPlayer.alive = false;
                    deadPlayer.place = playerData.filter(p => !p.alive).length + 1;
                }
            }
        });
    });

    // Check for winner
    let alivePlayers = playerData.filter(p => p.alive);
    if (alivePlayers.length === 1) {
        alivePlayers[0].place = 1;
        simulationActive = false;
        showResults();
    }
}

function showResults() {
    let container = document.getElementById('game-container');
    container.innerHTML = '<h2>Simulation Results</h2>';
    playerData.sort((a,b) => a.place - b.place).forEach(p => {
        container.innerHTML += `<p>${p.place}. ${p.name} - Kills: ${p.kills}</p>`;
    });
}
