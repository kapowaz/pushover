import { style } from '@vanilla-extract/css';

export const gameContainer = style({
  position: 'relative',
  width: 'min(640px, 100%, calc(100vh * 4 / 3))',
  aspectRatio: '4 / 3',
  imageRendering: 'pixelated',
});

export const gameCanvas = style({
  display: 'block',
  width: '100%',
  height: '100%',
  touchAction: 'none',
});
