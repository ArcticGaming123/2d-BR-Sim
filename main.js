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

const game = new Phaser.Game(config);

let players = [];

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('map', 'assets/map.png'); // optional
}

function create() {
    this.add.image(400, 300, 'map'); // background

    // Example: create 5 CPU players
    for (let i = 0; i < 5; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        let player = this.add.sprite(x, y, 'player');
        player.health = 100;
        player.name = 'CPU ' + (i + 1);
        players.push(player);
    }
}

function update() {
    // Simple random movement for each CPU
    players.forEach(player => {
        player.x += Phaser.Math.Between(-1, 1);
        player.y += Phaser.Math.Between(-1, 1);

        // Keep within bounds
        player.x = Phaser.Math.Clamp(player.x, 0, 800);
        player.y = Phaser.Math.Clamp(player.y, 0, 600);
    });
}
