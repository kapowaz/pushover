import { style } from '@vanilla-extract/css';

export const gameContainer = style({
  position: 'relative',
  width: 640,
  height: 480,
  imageRendering: 'pixelated',
});

export const gameCanvas = style({
  display: 'block',
  width: '100%',
  height: '100%',
});
