#ifndef __EFFECTS_H
#define __EFFECTS_H

#define EFF_FRAMES 16

SDL_Surface *effectImage[EFF_FRAMES];

//array to store effects
float effects[MAPWIDTH][MAPHEIGHT2];

#define EFF_EXPLOSION 0
#define EFF_DUST 1

void loadEffectsImages()
{
	int i;

	//create a load of blank tiles
	for(i = 0; i < EFF_FRAMES; i++)
	{
		effectImage[i] = SDL_CreateRGBSurface(0, 32, 32, 32, 0, 0, 0, 0);
		SDL_SetColorKey(effectImage[i], SDL_SRCCOLORKEY, 0xFF00FF);
	}

	SDL_Surface *temp = IMG_Load("Resource\\Image\\Effect.ishi");

	for(i = 0; i < EFF_FRAMES; i++)
	{
		blit(temp, i * -32, 0, effectImage[i]);
	}

	SDL_FreeSurface(temp);
}

void startEffect(int x, int y, int style)
{
	effects[x][y] = style * 8 + 1;
}

void processEffects()
{
	int x, y;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(effects[x][y])
			{
				effects[x][y] += 0.66;
				if(static_cast<int>(effects[x][y] - 0.5) % 8 == 0)
				{
					effects[x][y] = 0;
				}
			}
		}
	}
}

void drawEffects()
{
	int x, y;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(effects[x][y])
			{
				blit(effectImage[static_cast<int>(effects[x][y]) - 1], (x - 1) * 32, y * 16, screen);
			}
		}
	}
}

#endif