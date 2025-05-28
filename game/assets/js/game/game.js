import MainScene from './mainscene.js';
import GameOverScene from './gameover.js';

const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 480,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [MainScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    render: {}
};

new Phaser.Game(config);