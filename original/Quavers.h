#ifndef __QUAVERS_H
#define __QUAVERS_H

SDL_Surface *shadow[2];
AnimImage prize;
SDL_Surface *prizeBackdrop;

void loadPrize()
{
	shadow[0] = IMG_Load("Resource\\Image\\Shadow.ishi");
	SDL_SetColorKey(shadow[0], SDL_SRCCOLORKEY, 0xFF00FF);

	shadow[1] = IMG_Load("Resource\\Image\\Shadow2.ishi");
	SDL_SetColorKey(shadow[1], SDL_SRCCOLORKEY, 0xFF00FF);

	prize.load("Resource\\Image\\Prize.ishi", 64, 64, 2, 2);

	prizeBackdrop = IMG_Load("Resource\\Image\\Prize Backdrop.ishi");
	SDL_SetColorKey(prizeBackdrop, SDL_SRCCOLORKEY, 0xFF00FF);
}

void checkPrize()
{
	if(activeProfile && (mapSet == MS_ORIGINAL || mapSet == MS_NEW))
	{
		int i(-1);

		switch(currentMap)
		{
		case 11:
			i = 0;
			break;
		case 22:
			i = 1;
			break;
		case 33:
			i = 2;
			break;
		case 44:
			i = 3;
			break;
		case 55:
			i = 4;
			break;
		case 66:
			i = 5;
			break;
		case 77:
			i = 6;
			break;
		case 88:
			i = 7;
			break;
		case 99:
			i = 8;
			break;
		case 100:
			i = 9;
			break;
		}

		if(i != -1)
		{
			if(!activeProfile->data->prizeGot[i][mapSet])
			{
				activeProfile->data->prizeGot[i][mapSet] = true;
				saveProfiles();

				blankPause();
				requestMusic(101);

				screenFade = 0;
				SDL_Delay(1000);
				messageBox(MSG_PRIZE,i);

				playSound(-1, SND_FALL, 0, 320);

				//prize video
				int timeout = 275;
				int i2;
				float prizeY = -64;
				float prizeYV = 20;

				float rumble = 0;
				int rumbleOffset;

				screenFade = 255;
				while(timeout > 50)
				{
					DoEvents();

					if(KeyHit(SDLK_ESCAPE))
					{
						fadeOut();
						exit(1);
					}

					//screenfade
					screenFade -= 48;
					if(screenFade < 0)
						screenFade = 0;

					timeout--;

					if(rumble > 0)
					{
						rumble -= 0.5;
						if(rumble < 1)
							rumble = 0;
					}

					//prize
					if(i != 9)
					{
						if(timeout < 179) //holding
						{
							prizeY += prizeYV;
							prizeYV += 0.6;
							if(prizeY > 228)
							{
								prizeY = 228;
								prizeYV = 0;
							}
						}
						else if(timeout == 180) //straighten
						{
							prizeYV = -5;
							playSound(-1, SND_GI_SMILE, 0, 320);
						}
						else if(timeout < 211) //caught
						{
							prizeY = 232;
						}
						else if(timeout < 225) //fall
						{
							prizeY += prizeYV;
						}
					}
					else
					//100% extra free
					{
						if(timeout < 209) //landed
						{
							prizeY = 260;
						}
						else if(timeout < 225) //fall
						{
							prizeY += prizeYV;
						}

						if(timeout == 209)
							rumble = 16;
					}

					//draw
					if(rumble)
						rumbleOffset = (rand() % static_cast<int>(rumble)) - (rumble * 0.5);
					else
						rumbleOffset = 0;

					CLEARSCREEN;
					blit(prizeBackdrop,0,0,screen);

					//ledge
					blit(tileset[11],192,320 + rumbleOffset,screen);
					blit(tileset[0], 192,320 + rumbleOffset,screen);
					for(i2 = 1; i2 < 7; i2++)
					{
						blit(tileset[12],192 + i2 * 32,320 + rumbleOffset,screen);
						blit(tileset[1], 192 + i2 * 32,320 + rumbleOffset,screen);
					}
					blit(tileset[13],416,320 + rumbleOffset,screen);
					blit(tileset[2], 416,320 + rumbleOffset,screen);

					//shadow
					blitalpha(shadow[i == 9], 288, 320 + rumbleOffset, screen, (64 + prizeY) * 0.5);

					//prize
					int frame = 0;
					if(i == 9) frame = 1;
					if(mapSet == MS_NEW) frame += 2;
					blit(prize.frame(frame), 288, static_cast<int>(prizeY) + rumbleOffset, screen);

					//GI
					if(i != 9)
					{
						if((timeout <= 130 && timeout >= 120) || (timeout <= 100 && timeout >= 90)) //blinking
						{
							blit(GI[GIF_HOLDPRIZEBLINK][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
						else if(timeout < 181) //holding straight
						{
							blit(GI[GIF_HOLDPRIZE][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
						else if(timeout < 211) //caught
						{
							blit(GI[GIF_CATCH][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
						else //standing
						{
							blit(GI[GIF_STAND][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
					}
					else
					//100% extra free
					{
						if(timeout <= 209) //dead
						{
							blit(GI[GIF_FLAT][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
						else //standing
						{
							blit(GI[GIF_STAND][ants.first->data->currentCostume], 300, 284 + rumbleOffset, screen);
						}
					}

					//screen fade
					if(screenFade)
					{
						blitalpha(blackScreen, 0, 0, screen, screenFade);
					}

					SDL_Flip(screen);
					Timer();
				}

				fadeOut();
				CLEARSCREEN;
				SDL_Flip(screen);
				SDL_Delay(1000);

				//screenFade = 0;
				//messageBox(MSG_COSTUMEUNLOCK);
				//fadeOut();

				//char debug[255] = "";
				//sprintf(debug, "i = %i   ..   mapSet = %i   ..  currentMap = %i", i, mapSet, currentMap);
				//MessageBox(NULL, debug, debug, MB_OK);

				//unlocked a costume?
				//mapset 0, level 55
				if(i == 4 && mapSet == 0)
				{
					activeProfile->data->costumesUnlocked++;
					saveProfiles();
					screenFade = 0;
					messageBox(MSG_COSTUMEUNLOCK);
					fadeOut();
				}
				//mapset 0, level 100
				if(i == 9 && mapSet == 0)
				{
					/*
					activeProfile->data->costumesUnlocked++;
					saveProfiles();
					screenFade = 0;
					messageBox(MSG_COSTUMEUNLOCK);
					fadeOut();
					*/

					//completed whole game --- show screen
					SDL_Surface *final;
					final = IMG_Load("Resource\\Image\\Final.ishi");
					
					while(!ants.first->data->contHit(CONTFIRE))
					{
						if(!DoEvents() || KeyDown(SDLK_ESCAPE))
						{
							fadeOut();
							exit(1);
						}

						//screenfade
						screenFade -= 48;
						if(screenFade < 0)
							screenFade = 0;

						blit(final,0,0,screen);

						//screen fade
						if(screenFade)
						{
							blitalpha(blackScreen, 0, 0, screen, screenFade);
						}

						SDL_Flip(screen);
						Timer();
					}
					playSound(-1, SND_BEEP2, 0, 320);

					fadeOut();
					SDL_FreeSurface(final);
				}

				blankPause();
			}
		}
	}
}

int prizeCount()
{
	int count = 0, i;

	for(i = 0; i < 10; i++)
	{
		if(activeProfile->data->prizeGot[i][0])
			count++;
		if(activeProfile->data->prizeGot[i][1])
			count++;
	}

	return count;
}

#endif