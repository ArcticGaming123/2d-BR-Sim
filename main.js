let numPlayersInput = document.getElementById('numPlayers');
let playerNamesContainer = document.getElementById('playerNamesContainer');
let startBtn = document.getElementById('startBtn');
let mapChoiceInput = document.getElementById('mapSize');

let playerNames = [];

// Dynamically generate player name inputs when number changes
numPlayersInput.addEventListener('input', () => {
    const num = parseInt(numPlayersInput.value);
    playerNamesContainer.innerHTML = '';
    for (let i = 0; i < num; i++) {
        const input = document.createElement('input');
        input.placeholder = `Player ${i + 1} Name`;
        input.id = `playerName${i}`;
        playerNamesContainer.appendChild(input);
        playerNamesContainer.appendChild(document.createElement('br'));
    }
});

// Trigger input once to generate default names
numPlayersInput.dispatchEvent(new Event('input'));

// Start simulation when button clicked
startBtn.onclick = () => {
    const num = parseInt(numPlayersInput.value);
    playerNames = [];
    for (let i = 0; i < num; i++) {
        const name = document.getElementById(`playerName${i}`).value || `Player ${i + 1}`;
        playerNames.push(name);
    }
    const mapChoice = mapChoiceInput.value;

    // Hide menu and show game
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // Start Phaser game
    startPhaserGame(num, playerNames, mapChoice);
};

// ---- Phaser Game ----

function startPhaserGame(numPlayers, names, mapChoice) {
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

    new Phaser.Game(config);

    let players = [];
    let playerData = [];
    let simulationActive = true;

    function preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('map-small', 'assets/map-small.png');
        this.load.image('map-medium', 'assets/map-medium.png');
        this.load.image('map-big', 'assets/map-big.png');
    }

    function create() {
        this.add.image(400, 300, `map-${mapChoice}`);

        players = [];
        playerData = [];

        for (let i = 0; i < numPlayers; i++) {
            let x = Phaser.Math.Between(50, 750);
            let y = Phaser.Math.Between(50, 550);
            let player = this.add.sprite(x, y, 'player');
            player.health = 100;
            player.name = names[i];
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

        players.forEach(player => {
            if (player.health <= 0) return;

            // Random movement
            player.x += Phaser.Math.Between(-1, 1);
            player.y += Phaser.Math.Between(-1, 1);
            player.x = Phaser.Math.Clamp(player.x, 0, 800);
            player.y = Phaser.Math.Clamp(player.y, 0, 600);

            // Combat
            players.forEach(target => {
                if (target === player || target.health <= 0) return;
                let distance = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
                if (distance < 30) {
                    target.health -= 1;
                    if (target.health <= 0) {
                        let killer = playerData.find(p => p.name === player.name);
                        killer.kills += 1;

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
}
