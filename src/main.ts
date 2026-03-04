import './styles/global.css';
import { gameContainer, gameCanvas } from './styles/game.css';
import { Game } from './game/Game';

const app = document.getElementById('app')!;

const container = document.createElement('div');
container.className = gameContainer;

const canvas = document.createElement('canvas');
canvas.className = gameCanvas;
canvas.width = 640;
canvas.height = 480;

container.appendChild(canvas);
app.appendChild(container);

const game = new Game(canvas);
game.start();
