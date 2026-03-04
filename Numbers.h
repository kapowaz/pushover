#ifndef __NUMBERS_H
#define __NUMBERS_H

//timer!
int mins, secs, prevTicks, newTicks, countTicks;
bool negative;

//number images
SDL_Surface *numbers[22];

void loadNumberImages()
{
	int i;

	//create a load of blank tiles
	for(i = 0; i < 22; i++)
	{
		numbers[i] = SDL_CreateRGBSurface(0, 16, 32, 32, 0, 0, 0, 0);
		SDL_SetColorKey(numbers[i], SDL_SRCCOLORKEY, 0xFF00FF);
	}

	//load the numbers and draw them to the blank tiles
	SDL_Surface *temp = IMG_Load("Resource\\Image\\Number.ishi");

	for(i = 0; i < 22; i++)
	{
		blit(temp, i * -16, 0, numbers[i]);
	}

	SDL_FreeSurface(temp);
}

void drawLevelCounter(int level)
{
	//should these be drawn transparent?
	bool transparent = 0;
	int x, y, i;
	for(x = MAPWIDTH - 4; x < MAPWIDTH; x++)
	{
		for(y = MAPHEIGHT2 - 6; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 2; i++)
			{
				if(domino[x][y][i] > 0)
					transparent = true;

				for(antEl = ants.first; antEl != NULL; NE(antEl))
				{
					if(antEl->data->GIX == x && antEl->data->GIY == y)
						transparent = true;
				}
			}
		}
	}

	for(i = 0; i < 3; i++)
	{
		if(!transparent)
			blit(numbers[level % 10], 608 - (i * 16), 440, screen);
		else
			blitalpha(numbers[level % 10], 608 - (i * 16), 440, screen, 160);
		level /= 10;
	}

	//draw mapset counter too
	//blit(numbers[mapSet], 608, 408, screen);

	//draw tokens
	level = GITokens;
	for(i = 0; i < 3; i++)
	{
		if(!transparent)
			blit(numbers[level % 10], 608 - (i * 16), 408, screen);
		else
			blitalpha(numbers[level % 10], 608 - (i * 16), 408, screen, 160);
		level /= 10;
	}

	//draw FPS
	if(DEVVERSION)
	{
		level = lastFrameCount;
		for(i = 0; i < 3; i++)
		{
			blitalpha(numbers[level % 10], 608 - (i * 16), 8, screen, 128);
			level /= 10;
		}
	}
}

void initTimer(int m, int s)
{
	prevTicks = GetTickCount();
	countTicks = 0;

	mins = m;
	secs = s;

	negative = 0;
}

void updateTimer()
{
	newTicks = GetTickCount();
	countTicks += newTicks - prevTicks;
	prevTicks = newTicks;

	if(countTicks >= 1000)
	{
		countTicks -= 1000;

		if(!negative)
		{
			//frame count thing for fps check
			lastFrameCount = frameCount;
			frameCount = 0;

			secs--;
			if(secs < 0)
			{
				mins--;
				secs = 59;
				if(mins < 0)
				{
					mins = 0;
					secs = 0;
					negative = 1;
				}
			}
		}
		else
		{
			secs++;
			if(secs > 59)
			{
				mins++;
				secs = 0;
			}
		}
	}
}

void drawTimer()
{
	//should timer be drawn transparent?
	bool transparent = 0;
	int x, y, i;
	for(x = 0; x < 4; x++)
	{
		for(y = MAPHEIGHT2 - 3; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 2; i++)
			{
				if(domino[x][y][i] > 0)
					transparent = true;

				for(antEl = ants.first; antEl != NULL; NE(antEl))
				{
					if(antEl->data->GIX == x && antEl->data->GIY == y)
						transparent = true;
				}
			}
		}
	}

	int m = mins, s = secs;

	//mins
	for(i = 0; i < 2; i++)
	{
		if(!transparent)
			blit(numbers[(m % 10) + (negative * 11)], 32 - (i * 16), 440, screen);
		else
			blitalpha(numbers[(m % 10) + (negative * 11)], 32 - (i * 16), 440, screen, 160);
		m /= 10;
	}

	//colon
	if(countTicks <= 500)
	{
		if(!transparent)
			blit(numbers[10 + (negative * 11)], 48, 440, screen);
		else
			blitalpha(numbers[10 + (negative * 11)], 48, 440, screen, 160);
	}

	//secs
	for(i = 0; i < 2; i++)
	{
		if(!transparent)
			blit(numbers[(s % 10) + (negative * 11)], 80 - (i * 16), 440, screen);
		else
			blitalpha(numbers[(s % 10) + (negative * 11)], 80 - (i * 16), 440, screen, 160);
		s /= 10;
	}
}

#endif