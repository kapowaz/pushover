#ifndef __GI_H
#define __GI_H

void loadGIImages()
{
	int i, c;

	//create a load of blank tiles
	for(i = 0; i < GI_FRAMES; i++)
	{
		for(c = 0; c < 3; c++)
		{
			//SDL_FreeSurface(dominoes[i]);
			GI[i][c] = SDL_CreateRGBSurface(0, 40, 44, 32, 0, 0, 0, 0);
			SDL_SetColorKey(GI[i][c], SDL_SRCCOLORKEY, 0xFF00FF);
		}
	}

	//load and draw to the blank tiles
	SDL_Surface *temp = IMG_Load("Resource\\Image\\GI.ishi");

	for(i = 0; i < GI_FRAMES; i++)
	{
		for(c = 0; c < 3; c++)
		{
			blit(temp, i * -40, c * -44, GI[i][c]);
		}
	}

	SDL_FreeSurface(temp);
}

void classGI::setControls(int num)
{
	switch(num)
	{
	case 0: //single player controls
		upKey = SDLK_UP;
		downKey = SDLK_DOWN;
		leftKey = SDLK_LEFT;
		rightKey = SDLK_RIGHT;
		fireKey = SDLK_z;
		break;
	case 1: //two players, player 1
		upKey = SDLK_g;
		downKey = SDLK_b;
		leftKey = SDLK_v;
		rightKey = SDLK_n;
		fireKey = SDLK_z;
		break;
	case 2: //two players, player 2
		upKey = SDLK_UP;
		downKey = SDLK_DOWN;
		leftKey = SDLK_LEFT;
		rightKey = SDLK_RIGHT;
		fireKey = SDLK_SLASH;
		break;
	case 3: //no controls
		upKey = SDLK_HOME;
		downKey = SDLK_HOME;
		leftKey = SDLK_HOME;
		rightKey = SDLK_HOME;
		fireKey = SDLK_HOME;
		break;
	}
}

void classGI::draw(int postLadder)
{
	if(!enabled)
		return;

	if(!postLadder)
	{
		//dominorama
		if(GIDomino > 0)
		{
			int domDrawType = GIDomino;
			int domDrawYOffset(0);
			//if(currentMap == 100)
			//	domDrawType = 1;

			//walking right
			if(GIState == GI_HOLDRIGHT || GIState == GI_CARRYRIGHT || GIState == GI_CARRYUPRIGHT || GIState == GI_CARRYDOWNRIGHT || GIState == GI_GETUPRIGHT)
			{
				if(GIFrame == GIF_CARRYSTEP_RS + 1)
					domDrawYOffset = -2;
				if(GIFrame == GIF_CARRYSTEP_RS + 2)
					domDrawYOffset = 2;

				if(GIFrame == GIF_GETUP_RS)
					domDrawYOffset = 3;
				if(GIFrame == GIF_GETUP_RS + 1)
					domDrawYOffset = 2;
				if(GIFrame == GIF_GETUP_RS + 2)
					domDrawYOffset = 1;

				if(domDrawType != D_ASCENDER)
					blit(dominoes[((domDrawType - 1) * DOM_FPD) + (DOM_UPRIGHT - 2)], ((GIX - 1) * 32) - 8 + static_cast<int>(GIXOffset), (GIY * 16) - 36 + static_cast<int>(GIYOffset) + domDrawYOffset, screen);
				else
					blit(dominoes[((domDrawType - 1) * DOM_FPD) + (DOM_UPRIGHT + 2)], ((GIX - 1) * 32) - 24 + static_cast<int>(GIXOffset), (GIY * 16) - 32 + static_cast<int>(GIYOffset) + domDrawYOffset, screen);
			}

			//walking left
			else if(GIState == GI_HOLDLEFT || GIState == GI_CARRYLEFT || GIState == GI_CARRYUPLEFT || GIState == GI_CARRYDOWNLEFT || GIState == GI_GETUPLEFT)
			{
				if(GIFrame == GIF_CARRYSTEP_LS + 1)
					domDrawYOffset = -2;
				if(GIFrame == GIF_CARRYSTEP_LS + 2)
					domDrawYOffset = +2;

				if(GIFrame == GIF_GETUP_LS)
					domDrawYOffset = 3;
				if(GIFrame == GIF_GETUP_LS + 1)
					domDrawYOffset = 2;
				if(GIFrame == GIF_GETUP_LS + 2)
					domDrawYOffset = 1;

				if(domDrawType != D_ASCENDER)
					blit(dominoes[((domDrawType - 1) * DOM_FPD) + (DOM_UPRIGHT + 2)], ((GIX - 1) * 32) - 30 + static_cast<int>(GIXOffset), (GIY * 16) - 36 + static_cast<int>(GIYOffset) + domDrawYOffset, screen);
				else
					blit(dominoes[((domDrawType - 1) * DOM_FPD) + (DOM_UPRIGHT - 2)], ((GIX - 1) * 32) - 16 + static_cast<int>(GIXOffset), (GIY * 16) - 34 + static_cast<int>(GIYOffset) + domDrawYOffset, screen);
			}

			//pre fall left / right
			else if(GIState == GI_PREFALLLEFT && GIFrame <= GI_PREFALLDROPPOINT_L)
			{
				blit(dominoes[((domDrawType - 1) * DOM_FPD) + DOM_UPRIGHT], ((GIX - 1) * 32) - 20 + static_cast<int>(GIXOffset), (GIY * 16) - 32, screen);
			}
			else if(GIState == GI_PREFALLRIGHT && GIFrame <= GI_PREFALLDROPPOINT_R)
			{
				blit(dominoes[((domDrawType - 1) * DOM_FPD) + DOM_UPRIGHT], ((GIX - 1) * 32) - 20 + static_cast<int>(GIXOffset), (GIY * 16) - 32, screen);
			}
		}
	}

	if(GIState == GI_CLIMBUP || GIState == GI_CLIMBDOWN || GIState == GI_CLIMB)
	{
		if(postLadder)
		{
			//draw GI
			blit(GI[GIFrame][currentCostume], ((GIX - 1) * 32) - 4 + GIXOffset, (GIY * 16) - 32 + GIYOffset, screen);

			//dominorama again - in front of GI
			if(GIDomino > 0)
			{
				int domDrawType = GIDomino;
				//if(currentMap == 100)
				//	domDrawType = 1;

				//on ladder with domino
				//if(GIState == GI_CLIMBUP || GIState == GI_CLIMBDOWN || GIState == GI_CLIMB)
				//{
					blit(ladderDominoes[domDrawType - 1], ((GIX - 1) * 32) - 6 + GIXOffset, (GIY * 16) - 30 + GIYOffset, screen);
				//}
			}
		}
	}
	else if(!postLadder)
	{
		//draw GI
		blit(GI[GIFrame][currentCostume], ((GIX - 1) * 32) - 4 + GIXOffset, (GIY * 16) - 32 + GIYOffset, screen);
	}

	if(playerNum == 0)
		drawText(GIX * 32 - 16 - 8 + GIXOffset, GIY * 16 - 48 + GIYOffset, "1", 0, 1);
	else
		drawText(GIX * 32 - 16 + 8 + GIXOffset, GIY * 16 - 48 + GIYOffset, "2", 0, 1);
}

int notValidForPush(int x, int y)
{
	int i;

	if(domino[x][y][0] == 0 || domState[x][y][0] != STATE_STANDING)
		if(domino[x + 1][y][0] == 0 || domState[x + 1][y][0] != STATE_STANDING)
			return 1;
	if(ledge[x][y] == 0 || ledge[x + 1][y] == 0)// || ledge[x + 1][y] == 0)
		return 1;
	if((domino[x][y][0] == D_SPLITTER1 || domino[x][y][0] == 0) && (domino[x + 1][y][0] == D_SPLITTER1 || domino[x + 1][y][0] == 0))
		return 1;
	if(ledge[x + 1][y - 1] || ledge[x][y - 1])
		return 1;
	//domino leaning on this domino
	for(i = 0; i < 2; i++)
	{
		if((domino[x][y][i] > 0 && domFrame[x][y][i] > DOM_UPRIGHT) || (domino[x + 1][y][i] > 0 && domFrame[x + 1][y][i] < DOM_UPRIGHT))
			return 1;
	}
	
	return 0;
}

int putDownOK(int x, int y, int domType)
{
	int i;

	//no ledge
	if(ledge[x][y] == 0)
		return 0;

	//dominoes in the way
	for(i = 0; i < 2; i++)
	{
		//on this tile
		if(domino[x][y][i] > 0)
			return 0;

		//tile to the right, leaning in
		if(x > 0)
			if(domino[x - 1][y][i] && domFrame[x - 1][y][i] > DOM_UPRIGHT)
				return 0;

		//tile to the left, leaning in
		if(x + 1 < MAPWIDTH)
			if(domino[x + 1][y][i] && domFrame[x + 1][y][i] < DOM_UPRIGHT)
				return 0;

		//rubble
		if(rubble[x][y])
			return 0;
	}

	//door
	if(background[x][(y - 1) / 2] >= 7 && background[x][(y - 1) / 2] <= 11 && domType != D_VANISHER)
		return 0;

	return 1;
}

void classGI::process()
{
	int i;
	int y;

	if(!enabled)
		return;

	//change frame
	if(GIFrameChange >= 1)
	{
		GIFrameChange -= 1;
		GIFrame++;
	}

	if(GIFrameChange <= -1)
	{
		GIFrameChange += 1;
		GIFrame--;
	}

	if(GIState != GI_STAND)
	{
		GIHaiCount = 0;
	}

	switch(GIState)
	{
	case GI_EXIT:
		GIFrameChange += GI_EXITFRAMECHANGE;
		if(GIFrame > GIF_EXIT_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
		}

		break;

	case GI_ENTER:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_ENTERFRAMECHANGE;
		if(GIFrame > GIF_ENTER_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
			GIOut--;
			if(GIOut == 0)
			{
				levelState = LS_CLOSEEXIT;
			}
			enabled = false;
		}

		break;

	case GI_STAND:
		GIFrame = GIF_STAND;
		GIFrameChange = 0;
		GIXOffset = 0;
		GIYOffset = 0;

		//prepare to catch!
		if(GIOut == 2)
		{
			//other player is falling
			if(otherGI->data->GIState == GI_FALL)
			{
				//is other player above?
				if(otherGI->data->GIX == GIX && otherGI->data->GIY < GIY)
				{
					//is there a ledge in the way?
					bool check(false);

					for(y = GIY - 1; y > otherGI->data->GIY; y--)
					{
						if(ledge[GIX][y])
							check = true;
					}

					if(!check)
					{
						//prepare to catch!
						GIState = GI_CATCHWAIT;
						GIFrame = GIF_CATCHWAIT_S;
						GIFrameChange = 0;
					}
				}
			}
		}
		
		if(contDown(CONTLEFT))
		{
			GIState = GI_WALKLEFT;
			GIFrame = GIF_WALK_LS;
			GILastMoved = 0;

			if(ledge[GIX - 1][GIY] == 0)
			{
				//if about to fall off, wobble first
				GIState = GI_WOBBLELEFT;
				GIFrame = GIF_WOBBLE_LS;
				GIIterationsLeft = GI_WOBBLEITERATIONS;

				//if it's a step, jump down instead
				if(ledge[GIX - 1][GIY + 1])
				{
					GIState = GI_DOWNLEFT;
					GIFrame = GIF_DOWN_LS;
					GIXOffset = -8;
					GIFrameChange = 0;
				}

				//hang about - if the other player can catch, then leap across
				if(GIOut == 2)
				{
					if(otherGI->data->GIX == GIX - 2 && otherGI->data->GIY == GIY && otherGI->data->GIState == GI_STAND)
					{
						GIState = GI_LEAPLEFT;
						GIFrame = GIF_LEAP_LS;
						GIFrameChange = 0;

						renderFirst = otherGI;

						//make the other guy catch!
						otherGI->data->GIState = GI_LEAPCATCHRIGHT;
						otherGI->data->GIFrame = GIF_LEAPCATCH_RS;
						GIFrameChange = 0;

						playSound(-1, SND_HUP, 0, GIX * 32);
					}
				}
				
			}

			//if it's a step, jump up instead
			if(ledge[GIX - 1][GIY - 1])
			{
				GIState = GI_UPLEFT;
				GIFrame = GIF_UP_LS;
				GIXOffset = 0;
				GIFrameChange = 0;
			}
		}

		if(contDown(CONTRIGHT))
		{
			GIState = GI_WALKRIGHT;
			GIFrame = GIF_WALK_RS;
			GILastMoved = 1;

			if(ledge[GIX + 1][GIY] == 0)
			{
				//if about to fall off, wobble first
				GIState = GI_WOBBLERIGHT;
				GIFrame = GIF_WOBBLE_RS;
				GIIterationsLeft = GI_WOBBLEITERATIONS;

				//if it's a step, jump down instead
				if(ledge[GIX + 1][GIY + 1])
				{
					GIState = GI_DOWNRIGHT;
					GIFrame = GIF_DOWN_RS;
					GIXOffset = 8;
					GIFrameChange = 0;
				}

				//hang about - if the other player can catch, then leap across
				if(GIOut == 2)
				{
					if(otherGI->data->GIX == GIX + 2 && otherGI->data->GIY == GIY && otherGI->data->GIState == GI_STAND)
					{
						GIState = GI_LEAPRIGHT;
						GIFrame = GIF_LEAP_RS;
						GIFrameChange = 0;

						renderFirst = otherGI;

						//make the other guy catch!
						otherGI->data->GIState = GI_LEAPCATCHLEFT;
						otherGI->data->GIFrame = GIF_LEAPCATCH_LS;
						GIFrameChange = 0;

						playSound(-1, SND_HUP, 0, GIX * 32);
					}
				}
				
			}

			//if it's a step, jump up instead
			if(ledge[GIX + 1][GIY - 1])
			{
				GIState = GI_UPRIGHT;
				GIFrame = GIF_UP_RS;
				GIXOffset = 0;
				GIFrameChange = 0;
			}
		}

		//pick up domino
		for(i = 0; i < 2; i++)
		{
			if(contDown(CONTFIRE) && domino[GIX][GIY][i] > 0 && (domState[GIX][GIY][i] == STATE_STANDING ||((domino[GIX][GIY][i] == D_TUMBLER || domino[GIX][GIY][i] == D_ANTIGRAV) && domFrame[GIX][GIY][i] == DOM_UPRIGHT)))
			{
				//can't pick up trigger or starter
				if(domino[GIX][GIY][i] != D_TRIGGER && domino[GIX][GIY][i] != D_STARTER)
				{
					if(!GILastMoved)
					{
						GIState = GI_PICKUPLEFT;
						GIFrame = GIF_PICK_LS;
					}
					else
					{
						GIState = GI_PICKUPRIGHT;
						GIFrame = GIF_PICK_RS;
					}

					playSound(-1, SND_HUP, 0, GIX * 32);
					domState[GIX][GIY][i] = STATE_PICKUP;
					domFrame[GIX][GIY][i] = DOM_UPRIGHT;
					domFrameChange[GIX][GIY][i] = 0;
					pickupLayer = i;
				}
				else
				{
					//trying to pick trigger / starter up
					GIState = GI_SHAKEHEAD;
					GIFrame = GIF_SHAKEHEAD_S;
					GIIterationsLeft = GI_SHAKEHEADITERATIONS;
				}
			}
		}

		if(GIState == GI_PICKUPLEFT || GIState == GI_PICKUPRIGHT)
			break;

		//no ledge - fall
		if(!ledge[GIX][GIY])
		{
			GIState = GI_FALL;
			GIFrame = GIF_FALL_S;
			GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);
			break;
		}

		//climb ladder! (down)
		if(contDown(CONTDOWN))
		{
			if(ladder[GIX][GIY + 1])// && ladder[GIX][GIY + 1])
			{
				GIState = GI_CLIMBDOWN;
				GIFrame = GIF_CLIMB_S;
				break;
			}
		}

		if(contDown(CONTUP))
		{
			//enter level exit door
			if(levelState == LS_OPENEXIT && background[GIX][((GIY - 1) / 2)] == OPENDOOR)
			{
				//check there are no blocks in the way
				bool allowed = true;
				int i;

				for(i = 0; i < 2; i++)
				{
					//block in the way, standing or leaning to the left
					if(domino[GIX][GIY][i] && domFrame[GIX][GIY][i] <= DOM_UPRIGHT)
						allowed = false;

					//block leaning in from the left
					if(GIX > 0)
						if(domino[GIX - 1][GIY][i] && domFrame[GIX - 1][GIY][i] >= 9)
							allowed = false;
				}

				if(allowed)
				{
					playSound(-1, SND_LEVEL_COMPLETE, 0, GIX * 32);
					GIState = GI_ENTER;
					GIFrame = GIF_ENTER_S;
					break;
				}
			}

			//climb ladder! (up)
			if(ladder[GIX][GIY - 1])
			{
				GIState = GI_CLIMBUP;
				GIFrame = GIF_CLIMB_S;
			}

			//move to push position
			else
			{
				if(!GILastMoved)
				{
					GIX--;
					GIState = GI_MOVEBACKLEFT;
					GIFrame = GIF_MOVEBACK_LS;
				}
				else
				{
					GIState = GI_MOVEBACKRIGHT;
					GIFrame = GIF_MOVEBACK_RS;
				}
				GIXOffset = 16;

				//if not a valid position..
				if(notValidForPush(GIX,GIY))
				{
					//..try moving to the other possible position
					if(!GILastMoved)
					{
						GIX++;
						GILastMoved = 0;
						GIState = GI_MOVEBACKRIGHT;
						GIFrame = GIF_MOVEBACK_RS;
					}
					else
					{
						GIX--;
						GIState = GI_MOVEBACKLEFT;
						GIFrame = GIF_MOVEBACK_LS;
					}

					//if new position not valid..
					if(notValidForPush(GIX,GIY))
					{
						//..cancel move.
						GIState = GI_STAND;
						GIFrame = GIF_STAND;
						GIFrameChange = 0;
						GIXOffset = 0;

						if(GILastMoved)
						{
							GIX++;
						}
						else
						{
							//GIX--;
						}
					}
				}
			}
		}

		//wave!
		if(GIState == GI_STAND && GIWaved == false && levelCompleteState == 1)
		{
			GIWaved = true;
			
			GIFrameChange = 0;
			GIState = GI_WAVE;
			GIFrame = GIF_WAVE_S;
			GIIterationsLeft = GI_WAVEITERATIONS;

			playSound(-1, SND_GI_SMILE, 0, GIX * 32);
		}
		
		//shrug!
		if(GIState == GI_STAND && GIShrugNeeded == true)
		{
			GIShrugNeeded = false;

			GIFrameChange = 0;
			GIState = GI_SHRUG;
			GIFrame = GIF_SHRUG_S;

			playSound(-1, SND_TRY_AGAIN, 0, GIX * 32);
		}

		//cover ears!
		if(GIOut == 1 && GIState == GI_STAND && domino[GIX][GIY][0] == D_EXPLODER && !contDown(CONTDOWN) && !contDown(CONTUP))
		{
			GIFrameChange = 0;
			GIState = GI_COVEREARS;
			GIFrame = GIF_COVEREARS_S;
		}

		//hai count
		if(GIOut == 1 && GIState == GI_STAND)
		{
			GIHaiCount++;
			if(GIHaiCount >= GI_HAIWAITTIME)
			{
				GIState = GI_HAI;
				GIFrame = GIF_HAI_S;
				GIIterationsLeft = GI_HAIITERATIONS;

				playSound(-1, SND_HAI, 0, GIX * 32);
			}
		}

		break;

	case GI_HAI:
		GIFrameChange += GI_HAIFRAMECHANGE;
		if(GIFrame > GIF_HAI_E)
		{
			if(GIIterationsLeft)
			{
				GIFrame = GIF_HAI_S;
				GIIterationsLeft--;
			}
			else
			{
				GIState = GI_STAND;
				GIFrame = GIF_STAND;
			}
		}

		//prepare to catch!
		if(GIOut == 2)
		{
			//other player is falling
			if(otherGI->data->GIState == GI_FALL)
			{
				//is other player above?
				if(otherGI->data->GIX == GIX && otherGI->data->GIY < GIY)
				{
					//prepare to catch!
					GIState = GI_CATCHWAIT;
					GIFrame = GIF_CATCHWAIT_S;
					GIFrameChange = 0;
				}
			}
		}

		//press key to exit state early - also if there's no ledge
		if(contDown(CONTUP) || contDown(CONTDOWN) || contDown(CONTLEFT) || contDown(CONTRIGHT) || contDown(CONTFIRE) || ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_WAVE:
		GIFrameChange += GI_WAVEFRAMECHANGE;
		if(GIFrame > GIF_WAVE_E1 && GIIterationsLeft)
		{
			GIFrame = GIF_WAVE_S;
			GIIterationsLeft--;
		}

		if(GIFrame > GIF_WAVE_E2)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		//prepare to catch!
		if(GIOut == 2)
		{
			//other player is falling
			if(otherGI->data->GIState == GI_FALL)
			{
				//is other player above?
				if(otherGI->data->GIX == GIX && otherGI->data->GIY < GIY)
				{
					//prepare to catch!
					GIState = GI_CATCHWAIT;
					GIFrame = GIF_CATCHWAIT_S;
					GIFrameChange = 0;
				}
			}
		}

		//exit state early if there's no ledge
		if(ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_SHRUG:
		GIFrameChange += GI_SHRUGFRAMECHANGE;

		if(GIFrame > GIF_SHRUG_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		//exit state early if there's no ledge
		if(ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_COVEREARS:
		if(GIFrame < GIF_COVEREARS_E)
			GIFrameChange += GI_COVEREARSFRAMECHANGE;

		//prepare to catch!
		if(GIOut == 2)
		{
			//other player is falling
			if(otherGI->data->GIState == GI_FALL)
			{
				//is other player above?
				if(otherGI->data->GIX == GIX && otherGI->data->GIY < GIY)
				{
					//prepare to catch!
					GIState = GI_CATCHWAIT;
					GIFrame = GIF_CATCHWAIT_S;
					GIFrameChange = 0;
				}
			}
		}

		//press key to exit state early - also if there's no ledge
		if(contDown(CONTUP) || contDown(CONTDOWN) || contDown(CONTLEFT) || contDown(CONTRIGHT) || contDown(CONTFIRE) || ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_SHAKEHEAD:
		GIFrameChange += GI_SHAKEHEADFRAMECHANGE;
		if(GIFrame > GIF_SHAKEHEAD_E)
		{
			if(GIIterationsLeft)
			{
				GIFrame = GIF_SHAKEHEAD_S;
				GIIterationsLeft--;
			}
			else
			{
				GIState = GI_STAND;
				GIFrame = GIF_STAND;
			}
		}

		//exit state early if there's no ledge
		if(ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_WALKLEFT:
		GIFrameChange += GI_WALKFRAMECHANGE;
		if(GIFrame > GIF_WALK_LE)
			GIFrame = GIF_WALK_LS;

		GIXOffset -= GI_WALKSPEED;

		//walking off ledge - start falling
		if(ledge[GIX - 1][GIY] == 0 && GIXOffset <= -20)
		{
			GIYOffset += DOM_FALLSPEED;
		}
		else
			GIYOffset = 0;
		
		//change tile
		if(GIXOffset <= -32)
		{
			GIX--;
			GIXOffset += 32;

			//stand / fall
			if(ledge[GIX][GIY] > 0)
			{
				if(!contDown(CONTLEFT))
				{
					GIState = GI_STAND;
					GIFrame = GIF_STAND;
					GIFrameChange = 0;
					GIXOffset = 0;
				}
				else
				{
					if(ledge[GIX - 1][GIY] == 0)
					{
						//if about to fall off, wobble first
						GIState = GI_WOBBLELEFT;
						GIFrame = GIF_WOBBLE_LS;
						GIIterationsLeft = GI_WOBBLEITERATIONS;

						//if it's a step, jump down instead
						if(ledge[GIX - 1][GIY + 1])
						{
							GIState = GI_DOWNLEFT;
							GIFrame = GIF_DOWN_LS;
							GIXOffset = -8;
							GIFrameChange = 0;
						}

						//hang about - if the other player can catch, then leap across
						if(GIOut == 2)
						{
							if(otherGI->data->GIX == GIX - 2 && otherGI->data->GIY == GIY && otherGI->data->GIState == GI_STAND)
							{
								GIState = GI_LEAPLEFT;
								GIFrame = GIF_LEAP_LS;
								GIFrameChange = 0;

								renderFirst = otherGI;

								//make the other guy catch!
								otherGI->data->GIState = GI_LEAPCATCHRIGHT;
								otherGI->data->GIFrame = GIF_LEAPCATCH_RS;
								GIFrameChange = 0;

								playSound(-1, SND_HUP, 0, GIX * 32);
							}
						}
					}

					//if it's a step, jump up instead
					if(ledge[GIX - 1][GIY - 1])
					{
						GIState = GI_UPLEFT;
						GIFrame = GIF_UP_LS;
						GIXOffset = 0;
						GIFrameChange = 0;
					}

				}
			}
			else
			{
				GIState = GI_FALL;
				GIFrame = GIF_FALL_S;
				GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);
			}
		}

		break;

	case GI_WALKRIGHT:
		GIFrameChange += GI_WALKFRAMECHANGE;
		if(GIFrame > GIF_WALK_RE)
			GIFrame = GIF_WALK_RS;

		GIXOffset += GI_WALKSPEED;
		
		//walking off ledge - start falling
		if(ledge[GIX + 1][GIY] == 0 && GIXOffset >= 20)
		{
			GIYOffset += DOM_FALLSPEED;
		}
		else
			GIYOffset = 0;
		
		//change tile
		if(GIXOffset >= 32)
		{
			GIX++;
			GIXOffset -= 32;

			//stand / fall
			if(ledge[GIX][GIY] > 0)
			{
				if(!contDown(CONTRIGHT))
				{
					GIState = GI_STAND;
					GIFrame = GIF_STAND;
					GIFrameChange = 0;
					GIXOffset = 0;
				}
				else
				{
					if(ledge[GIX + 1][GIY] == 0)
					{
						//if about to fall off, wobble first
						GIState = GI_WOBBLERIGHT;
						GIFrame = GIF_WOBBLE_RS;
						GIIterationsLeft = GI_WOBBLEITERATIONS;

						//if it's a step, jump down instead
						if(ledge[GIX + 1][GIY + 1])
						{
							GIState = GI_DOWNRIGHT;
							GIFrame = GIF_DOWN_RS;
							GIXOffset = 8;
							GIFrameChange = 0;
						}

						//hang about - if the other player can catch, then leap across
						if(GIOut == 2)
						{
							if(otherGI->data->GIX == GIX + 2 && otherGI->data->GIY == GIY && otherGI->data->GIState == GI_STAND)
							{
								GIState = GI_LEAPRIGHT;
								GIFrame = GIF_LEAP_RS;
								GIFrameChange = 0;

								renderFirst = otherGI;

								//make the other guy catch!
								otherGI->data->GIState = GI_LEAPCATCHLEFT;
								otherGI->data->GIFrame = GIF_LEAPCATCH_LS;
								GIFrameChange = 0;

								playSound(-1, SND_HUP, 0, GIX * 32);
							}
						}
					}

					//if it's a step, jump up instead
					if(ledge[GIX + 1][GIY - 1])
					{
						GIState = GI_UPRIGHT;
						GIFrame = GIF_UP_RS;
						GIXOffset = 0;
						GIFrameChange = 0;
					}
				}
			}
			else
			{
				GIState = GI_FALL;
				GIFrame = GIF_FALL_S;
				GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);
			}
		}

		break;

	case GI_PICKUPLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PICKFRAMECHANGE;
		if(GIFrame > GIF_PICK_LE)
		{
			GIState = GI_GETUPLEFT;
			GIFrame = GIF_GETUP_LS;

			GIDomino = domino[GIX][GIY][pickupLayer];
			if(GIDomino == D_DELAY1) GIDomino = D_DELAY2;
			domino[GIX][GIY][pickupLayer] = 0;
			domDelay[GIX][GIY][pickupLayer] = 0;

			if(GIDomino == 0)
				GIState = GI_STAND;
		}

		break;

	case GI_PICKUPRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PICKFRAMECHANGE;
		if(GIFrame > GIF_PICK_RE)
		{
			GIState = GI_GETUPRIGHT;
			GIFrame = GIF_GETUP_RS;

			GIDomino = domino[GIX][GIY][pickupLayer];
			if(GIDomino == D_DELAY1) GIDomino = D_DELAY2;
			domino[GIX][GIY][pickupLayer] = 0;
			domDelay[GIX][GIY][pickupLayer] = 0;

			if(GIDomino == 0)
				GIState = GI_STAND;
		}

		break;

	case GI_GETUPLEFT:
		GIFrameChange += GI_GETUPFRAMECHANGE;
		if(GIFrame > GIF_GETUP_LE)
		{
			GIState = GI_HOLDLEFT;
			GIFrame = GIF_HOLD_L;
		}

		break;
		
	case GI_GETUPRIGHT:
		GIFrameChange += GI_GETUPFRAMECHANGE;
		if(GIFrame > GIF_GETUP_RE)
		{
			GIState = GI_HOLDRIGHT;
			GIFrame = GIF_HOLD_R;
		}

		break;

	case GI_HOLDLEFT:
		GIFrame = GIF_HOLD_L;
		GIFrameChange = 0;
		GIXOffset = 0;

		if(contDown(CONTLEFT))
		{
			GIState = GI_CARRYLEFT;
			GIFrame = GIF_CARRY_LS;
			GILastMoved = 0;

			//if it's a step, jump instead
			if(ledge[GIX - 1][GIY - 1])
			{
				GIState = GI_CARRYUPLEFT;
				GIFrame = GIF_CARRYSTEP_LS;
			}

			if(ledge[GIX - 1][GIY] == 0 && ledge[GIX - 1][GIY + 1])
			{
				GIState = GI_CARRYDOWNLEFT;
				GIFrame = GIF_CARRYSTEP_LS;
			}
		}

		if(contDown(CONTRIGHT))
		{
			GIState = GI_CARRYRIGHT;
			GIFrame = GIF_CARRY_RS;
			GILastMoved = 1;

			//if it's a step, jump instead
			if(ledge[GIX + 1][GIY - 1])
			{
				GIState = GI_CARRYUPRIGHT;
				GIFrame = GIF_CARRYSTEP_RS;
			}

			if(ledge[GIX + 1][GIY] == 0 && ledge[GIX + 1][GIY + 1])
			{
				GIState = GI_CARRYDOWNRIGHT;
				GIFrame = GIF_CARRYSTEP_RS;
			}
		}

		//climb ladder! (down)
		if(contDown(CONTDOWN) && ladder[GIX][GIY + 1])// && ladder[GIX][GIY + 1])
		{
			GIState = GI_CLIMBDOWN;
			GIFrame = GIF_CLIMB_S;
			break;
		}

		//climb ladder! (up)
		if(contDown(CONTUP) && ladder[GIX][GIY - 1])
		{
			GIState = GI_CLIMBUP;
			GIFrame = GIF_CLIMB_S;
			break;
		}

		//put down domino
		if(contDown(CONTFIRE) && putDownOK(GIX,GIY,GIDomino))
		{
			if(!GILastMoved)
			{
				GIState = GI_PUTDOWNLEFT;
				GIFrame = GIF_PICK_LE - 2;
			}
			else
			{
				GIState = GI_PUTDOWNRIGHT;
				GIFrame = GIF_PICK_RE - 2;
			}
			domino[GIX][GIY][0] = GIDomino;
			domState[GIX][GIY][0] = STATE_PUTDOWN;
			domFrame[GIX][GIY][0] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][0] = 0;
			domY[GIX][GIY][0] = 3;
			domX[GIX][GIY][0] = -2.25;
			GIDomino = 0;
		}

		//fall! e.g. if exploder takes ledge out from beneath GI
		if(!ledge[GIX][GIY])
		{
			GIState = GI_FALL;
			GIFrame = GIF_FALL_S;
			GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);

			int putLayer = 0;
			if(domino[GIX][GIY][0])
				putLayer = 1;

			domino[GIX][GIY][putLayer] = GIDomino;
			domState[GIX][GIY][putLayer] = STATE_STANDING;
			if(domino[GIX][GIY][putLayer] == D_ASCENDER)
				domState[GIX][GIY][putLayer] = STATE_ASCEND;
			domFrame[GIX][GIY][putLayer] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][putLayer] = 0;
			domY[GIX][GIY][putLayer] = 0;
			GIDomino = 0;
			playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
		}

		break;

	case GI_HOLDRIGHT:
		GIFrame = GIF_HOLD_R;
		GIFrameChange = 0;
		GIXOffset = 0;

		if(contDown(CONTLEFT))
		{
			GIState = GI_CARRYLEFT;
			GIFrame = GIF_CARRY_LS;
			GILastMoved = 0;

			//if it's a step, jump instead
			if(ledge[GIX - 1][GIY - 1])
			{
				GIState = GI_CARRYUPLEFT;
				GIFrame = GIF_CARRYSTEP_LS;
			}

			if(ledge[GIX - 1][GIY] == 0 && ledge[GIX - 1][GIY + 1])
			{
				GIState = GI_CARRYDOWNLEFT;
				GIFrame = GIF_CARRYSTEP_LS;
			}
		}

		if(contDown(CONTRIGHT))
		{
			GIState = GI_CARRYRIGHT;
			GIFrame = GIF_CARRY_RS;
			GILastMoved = 1;

			//if it's a step, jump instead
			if(ledge[GIX + 1][GIY - 1])
			{
				GIState = GI_CARRYUPRIGHT;
				GIFrame = GIF_CARRYSTEP_RS;
			}

			if(ledge[GIX + 1][GIY] == 0 && ledge[GIX + 1][GIY + 1])
			{
				GIState = GI_CARRYDOWNRIGHT;
				GIFrame = GIF_CARRYSTEP_RS;
			}
		}

		//climb ladder! (down)
		if(contDown(CONTDOWN) && ladder[GIX][GIY + 1])// && ladder[GIX][GIY + 1])
		{
			GIState = GI_CLIMBDOWN;
			GIFrame = GIF_CLIMB_S;
			break;
		}

		//climb ladder! (up)
		if(contDown(CONTUP) && ladder[GIX][GIY - 1])
		{
			GIState = GI_CLIMBUP;
			GIFrame = GIF_CLIMB_S;
			break;
		}

		//put down domino
		if(contDown(CONTFIRE) && putDownOK(GIX,GIY,GIDomino))
		{
			if(!GILastMoved)
			{
				GIState = GI_PUTDOWNLEFT;
				GIFrame = GIF_PICK_LE;
			}
			else
			{
				GIState = GI_PUTDOWNRIGHT;
				GIFrame = GIF_PICK_RE;
			}
			domino[GIX][GIY][0] = GIDomino;
			domState[GIX][GIY][0] = STATE_PUTDOWN;
			domFrame[GIX][GIY][0] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][0] = 0;
			domY[GIX][GIY][0] = 3;
			domX[GIX][GIY][0] = -2.25;
			GIDomino = 0;
		}

		//fall! e.g. if exploder takes ledge out from beneath GI
		if(!ledge[GIX][GIY])
		{
			GIState = GI_FALL;
			GIFrame = GIF_FALL_S;
			GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);

			int putLayer = 0;
			if(domino[GIX][GIY][0])
				putLayer = 1;

			domino[GIX][GIY][putLayer] = GIDomino;
			domState[GIX][GIY][putLayer] = STATE_STANDING;
			if(domino[GIX][GIY][putLayer] == D_ASCENDER)
				domState[GIX][GIY][putLayer] = STATE_ASCEND;
			domFrame[GIX][GIY][putLayer] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][putLayer] = 0;
			domY[GIX][GIY][putLayer] = 0;
			GIDomino = 0;
			playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
		}

		break;

	case GI_CARRYLEFT:
		GIFrameChange += GI_CARRYFRAMECHANGE;
		if(GIFrame > GIF_CARRY_LE)
			GIFrame = GIF_CARRY_LS;

		GIXOffset -= GI_CARRYSPEED;
		if(GIXOffset <= -32)
		{
			GIX--;
			GIXOffset += 32;

			if(!contDown(CONTLEFT))
			{
				GIState = GI_HOLDLEFT;
			}
			else
			{
				//if it's a step, jump instead
				if(ledge[GIX - 1][GIY - 1])
				{
					GIState = GI_CARRYUPLEFT;
					GIFrame = GIF_CARRYSTEP_LS;
				}

				if(ledge[GIX - 1][GIY] == 0 && ledge[GIX - 1][GIY + 1])
				{
					GIState = GI_CARRYDOWNLEFT;
					GIFrame = GIF_CARRYSTEP_LS;
				}
			}

			//check if fallen off ledge
			if(ledge[GIX][GIY] == 0)
			{
				GIState = GI_PREFALLRIGHT;
				GIFrame = GIF_PREFALL_RS;
				GIIterationsLeft = GI_PREFALLITERATIONS;
			}
		}

		break;

	case GI_CARRYRIGHT:
		GIFrameChange += GI_CARRYFRAMECHANGE;
		if(GIFrame > GIF_CARRY_RE)
			GIFrame = GIF_CARRY_RS;

		GIXOffset += GI_CARRYSPEED;
		if(GIXOffset >= 32)
		{
			GIX++;
			GIXOffset -= 32;

			if(!contDown(CONTRIGHT))
			{
				GIState = GI_HOLDRIGHT;
			}
			else
			{
				//if it's a step, jump instead
				if(ledge[GIX + 1][GIY - 1])
				{
					GIState = GI_CARRYUPRIGHT;
					GIFrame = GIF_CARRYSTEP_RS;
				}

				if(ledge[GIX + 1][GIY] == 0 && ledge[GIX + 1][GIY + 1])
				{
					GIState = GI_CARRYDOWNRIGHT;
					GIFrame = GIF_CARRYSTEP_RS;
				}
			}

			//check if fallen off ledge
			if(ledge[GIX][GIY] == 0)
			{
				GIState = GI_PREFALLLEFT;
				GIFrame = GIF_PREFALL_LS;
				GIIterationsLeft = GI_PREFALLITERATIONS;
			}
		}

		break;

	case GI_PUTDOWNLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange -= GI_PICKFRAMECHANGE;
		if(GIFrame < GIF_PICK_LS)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
		}

		break;

	case GI_PUTDOWNRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange -= GI_PICKFRAMECHANGE;
		if(GIFrame < GIF_PICK_RS)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
		}

		break;

	case GI_MOVEBACKLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_MOVEBACKFRAMECHANGE;
		if(GIFrame > GIF_MOVEBACK_LE)
		{
			GIState = GI_PUSHWAIT;
			if(GILastMoved)// && domino[GIX][GIY][0] && domFrame[GIX][GIY][0] == DOM_UPRIGHT && domino[GIX][GIY][0] != D_SPLITTER1)
			{
				GIFrame = GIF_PUSH_RS;
				GIFrameChange = 0;
				if(domino[GIX + 1][GIY][0] == 0 || domino[GIX + 1][GIY][0] == D_SPLITTER1 || domino[GIX + 1][GIY][0] == 0 || domFrame[GIX + 1][GIY][0] != DOM_UPRIGHT)
				{
					GIFrame = GIF_PUSH_LS;
					GILastMoved = 0;
				}
			}
			else
			{
				GIFrame = GIF_PUSH_LS;
				GIFrameChange = 0;
				if(domino[GIX][GIY][0] == 0 || domino[GIX][GIY][0] == D_SPLITTER1 || domino[GIX][GIY][0] == 0 || domFrame[GIX][GIY][0] != DOM_UPRIGHT)
				{
					GIFrame = GIF_PUSH_RS;
					GILastMoved = 1;
				}
			}
		}

		break;

	case GI_MOVEBACKRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_MOVEBACKFRAMECHANGE;
		if(GIFrame > GIF_MOVEBACK_RE)
		{
			GIState = GI_PUSHWAIT;
			if(GILastMoved)// && domino[GIX][GIY][0] && domFrame[GIX][GIY][0] == DOM_UPRIGHT && domino[GIX][GIY][0] != D_SPLITTER1)
			{
				GIFrame = GIF_PUSH_RS;
				GIFrameChange = 0;
				if(domino[GIX + 1][GIY][0] == 0 || domino[GIX + 1][GIY][0] == D_SPLITTER1 || domino[GIX + 1][GIY][0] == 0 || domFrame[GIX + 1][GIY][0] != DOM_UPRIGHT)
				{
					GIFrame = GIF_PUSH_LS;
					GILastMoved = 0;
				}
			}
			else
			{
				GIFrame = GIF_PUSH_LS;
				GIFrameChange = 0;
				if(domino[GIX][GIY][0] == 0 || domino[GIX][GIY][0] == D_SPLITTER1 || domino[GIX][GIY][0] == 0 || domFrame[GIX][GIY][0] != DOM_UPRIGHT)
				{
					GIFrame = GIF_PUSH_RS;
					GILastMoved = 1;
				}
			}
		}

		break;

	case GI_PUSHWAIT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange = 0;

		//fall
		if(ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			break;
		}
		if(ledge[GIX + 1][GIY] == 0)
		{
			GIState = GI_STAND;
			GIX++;
			break;
		}

		//get flattened
		if((domino[GIX][GIY][0] && domFrame[GIX][GIY][0] > DOM_UPRIGHT) || (domino[GIX + 1][GIY][0] && domFrame[GIX + 1][GIY][0] < DOM_UPRIGHT))
		{
			GIState = GI_FLAT;
			messageDelay = MESSAGEDELAY;
			messageDelayStyle = MSG_DIED;
			break;
		}

		//face left
		if(contDown(CONTLEFT) && ledge[GIX][GIY] && domino[GIX][GIY][0] && domFrame[GIX][GIY][0] == DOM_UPRIGHT && domino[GIX][GIY][0] != D_SPLITTER1)
		{
			GIFrame = GIF_PUSH_LS;
			GILastMoved = 0;
		} 

		//face right
		if(contDown(CONTRIGHT) && ledge[GIX + 1][GIY] && domino[GIX + 1][GIY][0] && domFrame[GIX + 1][GIY][0] == DOM_UPRIGHT && domino[GIX][GIY][0] != D_SPLITTER1)
		{
			GIFrame = GIF_PUSH_RS;
			GILastMoved = 1;
		}

		//check not facing a splitter
		if(!GILastMoved)//(GIFrame == GIF_PUSH_LS)
		{
			if(domino[GIX][GIY][0] == D_SPLITTER1)
			{
				GIFrame = GIF_PUSH_RS;
				GILastMoved = 1;
			}
		}

		//check not facing a splitter
		if(GILastMoved)//(GIFrame == GIF_PUSH_RS)
		{
			if(domino[GIX + 1][GIY][0] == D_SPLITTER1)
			{
				GIFrame = GIF_PUSH_LS;
				GILastMoved = 0;
			}
		}

		//move to front
		if(contDown(CONTDOWN))
		{
			if(GILastMoved)
			{
				GIState = GI_MOVEFRONTRIGHT;
				GIFrame = GIF_MOVEFRONT_RS;
			}
			else
			{
				GIState = GI_MOVEFRONTLEFT;
				GIFrame = GIF_MOVEFRONT_LS;
			}
		}

		//push!
		if(contDown(CONTFIRE) && GIPushesRemain > 0)
		{
			if(!GILastMoved && contDown(CONTLEFT))
			{
				saveTokenState();

				GIState = GI_PUSHLEFT;
				GIFrame = GIF_PUSH_LS;
				GIPushesRemain--;

				if(rebounder(GIX, GIY, 0))
				{
					GIState = GI_PUSHSTOPLEFT;
					GIFrame = GIF_PUSHSTOP_LS;
				}
				else if(domino[GIX][GIY][0] == D_ASCENDER || domino[GIX][GIY][0] == D_ROCKET)
				{
					GIState = GI_PUSHASCLEFT;
					GIFrame = GIF_PUSHASC_LS;
				}
			}
			else if(GILastMoved && contDown(CONTRIGHT))
			{
				saveTokenState();

				GIState = GI_PUSHRIGHT;
				GIFrame = GIF_PUSH_RS;
				GIPushesRemain--;

				if(rebounder(GIX + 1, GIY, 0))
				{
					GIState = GI_PUSHSTOPRIGHT;
					GIFrame = GIF_PUSHSTOP_RS;
				}
				else if(domino[GIX + 1][GIY][0] == D_ASCENDER || domino[GIX + 1][GIY][0] == D_ROCKET)
				{
					GIState = GI_PUSHASCRIGHT;
					GIFrame = GIF_PUSHASC_RS;
				}
			}
		}

		break;

	case GI_PUSHLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHPUSHPOINT_L && domState[GIX][GIY][0] == STATE_STANDING)
		{
			//sounds:
			switch(domino[GIX][GIY][0])
			{
				case D_TRIGGER:
					playSound(-1, SND_TRIGGER, 0, GIX * 32);
					break;
				case D_ASCENDER:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ROCKET:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ANTIGRAV:
				case D_TUMBLER:
					playSound(-1, SND_REBOUND, 0, GIX * 32);
					break;
				case D_DELAY2:
					if(starter == 0) playSound(-1, SND_DELAY, 0, GIX * 32);
					break;
				case D_VANISHER:
					playSound(-1, SND_VANISHER, 0, GIX * 32);
					break;
				case D_EXPLODER:
					playSound(-1, SND_EXPLODER, 0, GIX * 32);
					break;
				case D_COUNT1:
					playSound(-1, SND_COUNT1, 0, GIX * 32);
					break;
				case D_COUNT2:
					playSound(-1, SND_COUNT2, 0, GIX * 32);
					break;
				case D_COUNT3:
					playSound(-1, SND_COUNT3, 0, GIX * 32);
					break;
			}

			//actions:
			switch(domino[GIX][GIY][0])
			{
				case D_ASCENDER:
					domState[GIX][GIY][0] = STATE_ASCLEFT;
					break;
				case D_ROCKET:
					domState[GIX][GIY][0] = STATE_ASCEND;
					break;
				case D_STOPPER:
					//does nowt. can't be pushed.
					break;
				case D_EXPLODER:
					blowExploder(GIX,GIY,0);
					break;
				case D_DELAY2:
					if(starter == 0) domDelay[GIX][GIY][0] = -DOM_DELAYCOUNT;
					break;
				case D_MIMIC:
					mimics = -1;
					break;
				default:
					if(!rebounder(GIX,GIY,0) || domino[GIX][GIY][0] == D_DELAY2)
						domState[GIX][GIY][0] = STATE_FALLLEFT;
			}

			if(domino[GIX][GIY][0] == D_STARTER)
				starter = 0;
		}

		if(GIFrame > GIF_PUSH_LE)
		{
			GIState = GI_MOVEFRONTLEFT;
			GIFrame = GIF_MOVEFRONT_LS;
		}

		break;

	case GI_PUSHRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHPUSHPOINT_R && domState[GIX + 1][GIY][0] == STATE_STANDING)
		{
			//sounds:
			switch(domino[GIX + 1][GIY][0])
			{
				case D_TRIGGER:
					playSound(-1, SND_TRIGGER, 0, GIX * 32);
					break;
				case D_ASCENDER:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ROCKET:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ANTIGRAV:
				case D_TUMBLER:
					playSound(-1, SND_REBOUND, 0, GIX * 32);
					break;
				case D_DELAY2:
					if(starter == 0) playSound(-1, SND_DELAY, 0, GIX * 32);
					break;
				case D_VANISHER:
					playSound(-1, SND_VANISHER, 0, GIX * 32);
					break;
				case D_EXPLODER:
					playSound(-1, SND_EXPLODER, 0, GIX * 32);
					break;
				case D_COUNT1:
					playSound(-1, SND_COUNT1, 0, GIX * 32);
					break;
				case D_COUNT2:
					playSound(-1, SND_COUNT2, 0, GIX * 32);
					break;
				case D_COUNT3:
					playSound(-1, SND_COUNT3, 0, GIX * 32);
					break;
			}

			switch(domino[GIX + 1][GIY][0])
			{
				case D_ASCENDER:
					domState[GIX + 1][GIY][0] = STATE_ASCRIGHT;
					break;
				case D_ROCKET:
					domState[GIX + 1][GIY][0] = STATE_ASCEND;
					break;
				case D_STOPPER:
					//does nowt. can't be pushed.
					break;
				case D_EXPLODER:
					blowExploder(GIX + 1,GIY,0);
					break;
				case D_DELAY2:
					if(starter == 0) domDelay[GIX + 1][GIY][0] = DOM_DELAYCOUNT;
					break;
				case D_MIMIC:
					mimics = 1;
					break;
				default:
					if(!rebounder(GIX + 1,GIY,0) || domino[GIX + 1][GIY][0] == D_DELAY2)
						domState[GIX + 1][GIY][0] = STATE_FALLRIGHT;
			}

			if(domino[GIX + 1][GIY][0] == D_STARTER)
				starter = 0;
		}

		if(GIFrame > GIF_PUSH_RE)
		{
			GIState = GI_MOVEFRONTRIGHT;
			GIFrame = GIF_MOVEFRONT_RS;
		}

		break;

	case GI_PUSHSTOPLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHSTOPPUSHPOINT_L && domState[GIX][GIY][0] == STATE_STANDING && domDelay[GIX][GIY][0] == 0)
		{
			//sounds:
			switch(domino[GIX][GIY][0])
			{
				case D_DELAY2:
					if(starter == 0) playSound(-1, SND_DELAY, 0, GIX * 32);
					break;
			}

			//actions:
			switch(domino[GIX][GIY][0])
			{
				case D_DELAY2:
					if(starter == 0) domDelay[GIX][GIY][0] = -DOM_DELAYCOUNT;
					break;
			}
		}

		if(GIFrame > GIF_PUSHSTOP_LE)
		{
			GIState = GI_MOVEFRONTLEFT;
			GIFrame = GIF_MOVEFRONT_LS;
		}

		break;

	case GI_PUSHSTOPRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHSTOPPUSHPOINT_R && domState[GIX + 1][GIY][0] == STATE_STANDING && domDelay[GIX + 1][GIY][0] == 0)
		{
			//sounds:
			switch(domino[GIX + 1][GIY][0])
			{
				case D_DELAY2:
					if(starter == 0) playSound(-1, SND_DELAY, 0, GIX * 32);
					break;
			}

			switch(domino[GIX + 1][GIY][0])
			{
				case D_DELAY2:
					if(starter == 0) domDelay[GIX + 1][GIY][0] = DOM_DELAYCOUNT;
					break;
			}
		}

		if(GIFrame > GIF_PUSHSTOP_RE)
		{
			GIState = GI_MOVEFRONTRIGHT;
			GIFrame = GIF_MOVEFRONT_RS;
		}

		break;

	case GI_PUSHASCLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHASCPUSHPOINT_L && domState[GIX][GIY][0] == STATE_STANDING)
		{
			//sounds:
			switch(domino[GIX][GIY][0])
			{
				case D_ASCENDER:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ROCKET:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
			}

			//actions:
			switch(domino[GIX][GIY][0])
			{
				case D_ASCENDER:
					domState[GIX][GIY][0] = STATE_ASCLEFT;
					break;
				case D_ROCKET:
					domState[GIX][GIY][0] = STATE_ASCEND;
					break;
			}
		}

		if(GIFrame > GIF_PUSHASC_LE)
		{
			GIState = GI_MOVEFRONTLEFT;
			GIFrame = GIF_MOVEFRONT_LS;
		}

		break;

	case GI_PUSHASCRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_PUSHFRAMECHANGE;

		if(GIFrame == GI_PUSHASCPUSHPOINT_R && domState[GIX + 1][GIY][0] == STATE_STANDING)
		{
			//sounds:
			switch(domino[GIX + 1][GIY][0])
			{
				case D_ASCENDER:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
				case D_ROCKET:
					playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
					break;
			}

			switch(domino[GIX + 1][GIY][0])
			{
				case D_ASCENDER:
					domState[GIX + 1][GIY][0] = STATE_ASCRIGHT;
					break;
				case D_ROCKET:
					domState[GIX + 1][GIY][0] = STATE_ASCEND;
					break;
			}
		}

		if(GIFrame > GIF_PUSHASC_RE)
		{
			GIState = GI_MOVEFRONTRIGHT;
			GIFrame = GIF_MOVEFRONT_RS;
		}

		break;

	case GI_MOVEFRONTRIGHT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_MOVEFRONTFRAMECHANGE;
		if(GIFrame > GIF_MOVEFRONT_RE)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
			//if(GILastMoved)
				GIX++;
		}

		break;

	case GI_MOVEFRONTLEFT:
		renderFirst = otherGI->data->otherGI;
		GIFrameChange += GI_MOVEBACKFRAMECHANGE;
		if(GIFrame > GIF_MOVEFRONT_LE)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
			//if(GILastMoved)
				//GIX++;
		}

		break;

	case GI_WOBBLELEFT:
		GIFrameChange += GI_WOBBLEFRAMECHANGE;
		if(GIFrame > GIF_WOBBLE_LE)
		{
			if(GIIterationsLeft)
			{
				GIIterationsLeft--;
				GIFrame = GIF_WOBBLE_LS;
			}
			else
			{
				if(contDown(CONTLEFT))
				{
					GIState = GI_WALKLEFT;
					GIFrame = GIF_WALK_LS;
					GILastMoved = 0;
				}
				else
				{
					GIState = GI_STAND;
					GIFrame = GIF_STAND;
					GIFrameChange = 0;
					GIXOffset = 0;
				}
			}
		}

		break;

	case GI_WOBBLERIGHT:
		GIFrameChange += GI_WOBBLEFRAMECHANGE;
		if(GIFrame > GIF_WOBBLE_RE)
		{
			if(GIIterationsLeft)
			{
				GIIterationsLeft--;
				GIFrame = GIF_WOBBLE_RS;
			}
			else
			{
				if(contDown(CONTRIGHT))
				{
					GIState = GI_WALKRIGHT;
					GIFrame = GIF_WALK_RS;
					GILastMoved = 0;
				}
				else
				{
					GIState = GI_STAND;
					GIFrame = GIF_STAND;
					GIFrameChange = 0;
					GIXOffset = 0;
				}
			}
		}

		break;
	
	case GI_FALL:
		GIFrameChange += GI_FALLFRAMECHANGE;
		if(GIFrame > GIF_FALL_E)
		{
			GIFrame = GIF_FALL_S;
		}

		GIYOffset += DOM_FALLSPEED;
		if(GIYOffset >= 16)
		{
			GIYOffset -= 16;
			GIY++;
			GIFallTiles++;

			//get caught!
			if(GIOut == 2)
			{
				if(otherGI->data->GIState == GI_CATCHWAIT)
				{
					if(otherGI->data->GIY == GIY)
					{
						//GIY++;
						GIYOffset = 0;
						GIState = GI_CAUGHT;
						GIFrame = GIF_CAUGHT_S;
						GIFrameChange = 0;
						GIFallTiles = 0;
						if(Mix_Playing(GIFallChannel))
						{
							Mix_HaltChannel(GIFallChannel);
						}

						//set other GI's state
						otherGI->data->GIState = GI_CATCHPLAYER;
						otherGI->data->GIFrame = GIF_CATCHPLAYER_S;
						otherGI->data->GIFrameChange = 0;

						renderFirst = otherGI;

						playSound(-1, SND_CATCH, 0, GIX * 32);

						break;
					}
				}
			}

			//land!
			if(GIY < MAPHEIGHT2)
			{
				if(ledge[GIX][GIY] > 0)
				{
					if(GIFallTiles >= GI_DEATHTILES)
					{
						//dead
						GIState = GI_DIE;
						GIFrame = GIF_DIE_S;
						GIFallTiles = 0;
						messageDelay = MESSAGEDELAY;
						messageDelayStyle = MSG_DIED;

						//play land sound
						if(Mix_Playing(GIFallChannel))
						{
							Mix_HaltChannel(GIFallChannel);
							playSound(-1, SND_LAND, 0, GIX * 32);
						}
					}
					else
					{
						//not dead
						GIState = GI_LAND;
						GIFrame = GIF_LAND_S;
						GIIterationsLeft = GI_LANDITERATIONS;
						GIFallTiles = 0;

						//play land sound
						if(Mix_Playing(GIFallChannel))
						{
							Mix_HaltChannel(GIFallChannel);
							playSound(-1, SND_LAND, 0, GIX * 32);
						}
					}
				}
			}
			else
			{
				if(messageDelayStyle == 0)
				{
					messageDelay = MESSAGEDELAY;
					messageDelayStyle = MSG_DIED;
				}
			}

		}

		break;

	case GI_LAND:
		GIFrameChange += GI_LANDFRAMECHANGE;
		GIYOffset = 0;

		//loop
		if(GIIterationsLeft && GIFrame > GIF_LAND_E2)
		{
			GIFrame = GIF_LAND_S2;
			GIIterationsLeft--;
		}

		//end
		if(GIFrame > GIF_LAND_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
		}

		break;

	case GI_PREFALLLEFT:
		GIFrameChange += GI_PREFALLFRAMECHANGE;

		//drop domino
		if(GIFrame == GI_PREFALLDROPPOINT_L && GIDomino > 0)
		{
			int layer = 0;
			if(domino[GIX][GIY][0] > 0)
				layer = 1;

			domino[GIX][GIY][layer] = GIDomino;
			domState[GIX][GIY][layer] = STATE_STANDING;
			if(domino[GIX][GIY][layer] == D_ASCENDER)
				domState[GIX][GIY][layer] = STATE_ASCEND;
			domFrame[GIX][GIY][layer] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][layer] = 0;
			domY[GIX][GIY][layer] = 0;
			GIDomino = 0;
			playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
		}

		//loop
		if(GIIterationsLeft && GIFrame > GIF_PREFALL_LE2)
		{
			GIFrame = GIF_PREFALL_LS2;
			GIIterationsLeft--;
		}

		//end
		if(GIFrame > GIF_PREFALL_LE)
		{
			GIState = GI_FALL;
			GIFrame = GIF_FALL_S;
			GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);
		}

		break;

	case GI_PREFALLRIGHT:
		GIFrameChange += GI_PREFALLFRAMECHANGE;

		//drop domino
		if(GIFrame == GI_PREFALLDROPPOINT_R && GIDomino > 0)
		{
			domino[GIX][GIY][0] = GIDomino;
			domState[GIX][GIY][0] = STATE_STANDING;
			if(domino[GIX][GIY][0] == D_ASCENDER)
				domState[GIX][GIY][0] = STATE_ASCEND;
			domFrame[GIX][GIY][0] = DOM_UPRIGHT;
			domFrameChange[GIX][GIY][0] = 0;
			domY[GIX][GIY][0] = 0;
			GIDomino = 0;
			playSound(-1, SND_DOMINO_DROP, 0, GIX * 32);
		}

		//loop
		if(GIIterationsLeft && GIFrame > GIF_PREFALL_RE2)
		{
			GIFrame = GIF_PREFALL_RS2;
			GIIterationsLeft--;
		}

		//end
		if(GIFrame > GIF_PREFALL_RE)
		{
			GIState = GI_FALL;
			GIFrame = GIF_FALL_S;
			GIFallChannel = playSound(-1, SND_FALL, 0, GIX * 32);
		}

		break;

	case GI_CLIMBUP:
		GIFrameChange += GI_CLIMBFRAMECHANGE;
		if(GIFrame > GIF_CLIMB_E)
			GIFrame = GIF_CLIMB_S;

		GIYOffset -= GI_CLIMBSPEED;
		if(GIYOffset < -16)
		{
			GIYOffset += 16;
			GIY--;

			//stop moving
			if(ledge[GIX][GIY])
			{
				GIState = GI_CLIMB;
				GIFrame = GIF_CLIMB_S;
			}

			//climb down
			if(contDown(CONTDOWN))
			{
				GIState = GI_CLIMBDOWN;
				GIFrame = GIF_CLIMB_S;
			}
			else
			{
				//get off ladder
				if(!ladder[GIX][GIY - 1])
				{
					GIYOffset = 0;
					if(GIDomino == 0)
					{
						GIState = GI_STAND;
						GIFrame = GIF_STAND;
						GIFrameChange = 0;
						GIXOffset = 0;
					}
					else
					{
						if(!GILastMoved)
						{
							GIState = GI_HOLDLEFT;
							GIFrame = GIF_HOLD_L;
						}
						else
						{
							GIState = GI_HOLDRIGHT;
							GIFrame = GIF_HOLD_R;
						}
					}
				}
			}
		}

		break;

	case GI_CLIMBDOWN:
		GIFrameChange -= GI_CLIMBFRAMECHANGE;
		if(GIFrame < GIF_CLIMB_S)
			GIFrame = GIF_CLIMB_E;

		GIYOffset += GI_CLIMBSPEED;
		if(GIYOffset > 16)
		{
			GIYOffset -= 16;
			GIY++;

			//stop moving
			if(ledge[GIX][GIY])
			{
				GIState = GI_CLIMB;
				GIFrame = GIF_CLIMB_S;
			}

			//at the bottom of one of those dodgy ladders - stop moving
			if(ladder[GIX][GIY + 2] == 0 && ledge[GIX][GIY + 1] == 0 && ledge[GIX][GIY + 2])
			{
				GIState = GI_CLIMB;
				GIFrame = GIF_CLIMB_S;
			}

			//climb up
			if(contDown(CONTUP))
			{
				GIState = GI_CLIMBUP;
				GIFrame = GIF_CLIMB_S;
				GIFrameChange = 0;
			}
			else
			{
				//get off ladder
				if(!ladder[GIX][GIY + 1])
				{
					GIYOffset = 0;
					if(GIDomino == 0)
					{
						GIState = GI_STAND;
						GIFrame = GIF_STAND;
						GIFrameChange = 0;
						GIXOffset = 0;
					}
					else
					{
						if(!GILastMoved)
						{
							GIState = GI_HOLDLEFT;
							GIFrame = GIF_HOLD_L;
						}
						else
						{
							GIState = GI_HOLDRIGHT;
							GIFrame = GIF_HOLD_R;
						}
					}
				}
			}
		}

		break;

	case GI_CLIMB:
		GIFrame = GIF_CLIMB_S;
		GIFrameChange = 0;

		//get off
		if((contDown(CONTLEFT) ||contDown(CONTRIGHT) || contDown(CONTFIRE)) && ledge[GIX][GIY])
		{
			if(GIDomino == 0)
			{
				GIState = GI_STAND;
				GIFrame = GIF_STAND;
				GIFrameChange = 0;
				GIXOffset = 0;
			}
			else
			{
				if(!GILastMoved)
				{
					GIState = GI_HOLDLEFT;
					GIFrame = GIF_HOLD_L;
				}
				else
				{
					GIState = GI_HOLDRIGHT;
					GIFrame = GIF_HOLD_R;
				}
			}
		}

		//climb up
		if(contDown(CONTUP))
		{
			GIState = GI_CLIMBUP;
			GIFrame = GIF_CLIMB_S;
		}
		//climb down
		if(contDown(CONTDOWN))
		{
			GIState = GI_CLIMBDOWN;
			GIFrame = GIF_CLIMB_S;

			//at the bottom of one of those dodgy ladders - don't allow to climb down
			if(ladder[GIX][GIY + 2] == 0 && ledge[GIX][GIY + 1] == 0 && ledge[GIX][GIY + 2])
			{
				GIState = GI_CLIMB;
				GIFrame = GIF_CLIMB_S;
			}
		}

		break;

	case GI_DIE:
		GIYOffset = 0;
		GIFrameChange += GI_DIEFRAMECHANGE;
		if(GIFrame > GIF_DIE_E)
			GIFrame = GIF_DIE_E;

		break;

	case GI_UPLEFT:
		GIFrameChange += GI_UPFRAMECHANGE;

		if(GIFrame > GIF_UP_LE)
			GIFrame = GIF_UP_LE;

		//move
		GIXOffset -= 4;
		GIYOffset -= 2;
		if(GIXOffset <= -32)
		{
			GIX--;
			GIY--;
			GIXOffset = 0;
			GIYOffset = 0;
			GIState = GI_STAND;
			//GIFrame = GIF_STAND;
		}

		break;

	case GI_UPRIGHT:
		GIFrameChange += GI_UPFRAMECHANGE;
		if(GIFrame > GIF_UP_RE)
			GIFrame = GIF_UP_RE;

		//move
		GIXOffset += 4;
		GIYOffset -= 2;
		if(GIXOffset >= 32)
		{
			GIX++;
			GIY--;
			GIXOffset = 0;
			GIYOffset = 0;
			GIState = GI_STAND;
			//GIFrame = GIF_STAND;
		}

		break;

	case GI_DOWNLEFT:
		GIFrameChange += GI_DOWNFRAMECHANGE;
		if(GIFrame > GIF_DOWN_LE)
			GIFrame = GIF_DOWN_LE;

		//move
		GIXOffset -= 3;
		GIYOffset += 3;
		if(GIYOffset >= 16)
		{
			GIX--;
			GIY++;
			GIXOffset = 0;
			GIYOffset = 0;
			GIState = GI_STAND;
			//GIFrame = GIF_STAND;
		}

		break;

	case GI_DOWNRIGHT:
		GIFrameChange += GI_DOWNFRAMECHANGE;
		if(GIFrame > GIF_DOWN_RE)
			GIFrame = GIF_DOWN_RE;

		//move
		GIXOffset += 3;
		GIYOffset += 3;
		if(GIYOffset >= 16)
		{
			GIX++;
			GIY++;
			GIXOffset = 0;
			GIYOffset = 0;
			GIState = GI_STAND;
			//GIFrame = GIF_STAND;
		}

		break;

	case GI_CARRYUPLEFT:
		GIFrameChange += GI_CARRYSTEPFRAMECHANGE;

		//move
		GIXOffset -= 4;
		if(GIFrame <= GIF_CARRYSTEP_LS + 2)
			GIYOffset -= 3;
		else
			GIYOffset += 2;

		if(GIXOffset <= -32)
		{
			GIXOffset = -32;
			if(GIFrame > GIF_CARRYSTEP_LE)
			{
				GIX--;
				GIY--;
				GIXOffset = 0;
				GIYOffset = 0;
				GIFrameChange = 0;
				GIState = GI_HOLDLEFT;
				GIFrame = GIF_CARRYSTEP_LE;
			}
		}

		if(GIFrame > GIF_CARRYSTEP_LE)
			GIFrame = GIF_CARRYSTEP_LE;

		break;

	case GI_CARRYUPRIGHT:
		GIFrameChange += GI_CARRYSTEPFRAMECHANGE;

		//move
		GIXOffset += 4;
		if(GIFrame <= GIF_CARRYSTEP_RS + 2)
			GIYOffset -= 3;
		else
			GIYOffset += 2;

		if(GIXOffset >= 32)
		{
			GIXOffset = 32;
			if(GIFrame > GIF_CARRYSTEP_RE)
			{
				GIX++;
				GIY--;
				GIXOffset = 0;
				GIYOffset = 0;
				GIFrameChange = 0;
				GIState = GI_HOLDRIGHT;
				GIFrame = GIF_CARRYSTEP_RE;
			}
		}

		if(GIFrame > GIF_CARRYSTEP_RE)
			GIFrame = GIF_CARRYSTEP_RE;

		break;

	case GI_CARRYDOWNLEFT:
		GIFrameChange += GI_CARRYSTEPFRAMECHANGE;

		//move
		GIXOffset -= 4;
		if(GIFrame <= GIF_CARRYSTEP_LS + 1)
			GIYOffset -= 0.5;
		else
			GIYOffset += 3;

		if(GIXOffset <= -32)
		{
			GIXOffset = -32;
			if(GIFrame > GIF_CARRYSTEP_LE)
			{
				GIX--;
				GIY++;
				GIXOffset = 0;
				GIYOffset = 0;
				GIFrameChange = 0;
				GIState = GI_HOLDLEFT;
				GIFrame = GIF_CARRYSTEP_LE;
			}
		}

		if(GIFrame > GIF_CARRYSTEP_LE)
			GIFrame = GIF_CARRYSTEP_LE;

		break;

	case GI_CARRYDOWNRIGHT:
		GIFrameChange += GI_CARRYSTEPFRAMECHANGE;

		//move
		GIXOffset += 4;
		if(GIFrame <= GIF_CARRYSTEP_RS + 1)
			GIYOffset -= 0.5;
		else
			GIYOffset += 3;

		if(GIXOffset >= 32)
		{
			GIXOffset = 32;
			if(GIFrame > GIF_CARRYSTEP_RE)
			{
				GIX++;
				GIY++;
				GIXOffset = 0;
				GIYOffset = 0;
				GIFrameChange = 0;
				GIState = GI_HOLDRIGHT;
				GIFrame = GIF_CARRYSTEP_RE;
			}
		}

		if(GIFrame > GIF_CARRYSTEP_RE)
			GIFrame = GIF_CARRYSTEP_RE;

		break;

	case GI_FLAT:
		GIFrame = GIF_FLAT;
		break;

	case GI_CATCHWAIT:
		GIFrameChange += GI_CATCHWAITFRAMECHANGE;
		if(GIFrame > GIF_CATCHWAIT_E)
			GIFrame = GIF_CATCHWAIT_E;

		//press key to exit state early - also if there's no ledge
		if(contDown(CONTUP) || contDown(CONTDOWN) || contDown(CONTLEFT) || contDown(CONTRIGHT) || contDown(CONTFIRE) || ledge[GIX][GIY] == 0)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
		}

		break;

	case GI_CATCHPLAYER:
		GIFrameChange += GI_CATCHPLAYERFRAMECHANGE;
		if(GIFrame > GIF_CATCHPLAYER_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
		}

		break;

	case GI_CAUGHT:
		GIFrameChange += GI_CAUGHTFRAMECHANGE;
		if(GIFrame > GIF_CAUGHT_E)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
		}

		break;

	case GI_LEAPLEFT:
		GIFrameChange += GI_LEAPFRAMECHANGE;

		//catch sound
		if(GIFrameChange >= 1 && GIFrame == GIF_LEAP_LS + 7)
			playSound(-1, SND_CATCH, 0, GIX * 32);

		if(GIFrame >= GIF_LEAP_LS + 3 && GIFrame <= GIF_LEAP_LS + 7)
			GIXOffset -= 3;

		if(GIFrame == GIF_LEAP_LS + 3)
			GIYOffset -= 1;

		if(GIFrame == GIF_LEAP_LS + 5)
			GIYOffset += 1;

		if(GIFrame == GIF_LEAP_LS + 6)
			GIYOffset += 2;

		if(GIFrame == GIF_LEAP_LS + 7)
			GIYOffset += 3;

		if(GIFrame >= GIF_LEAP_LS + 9)
		{
			GIXOffset -= 1;
			GIYOffset -= 1;
		}

		if(GIFrame > GIF_LEAP_LE)
		{
			GIX -= 2;
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
			GIYOffset = 0;
		}

		break;

	case GI_LEAPRIGHT:
		GIFrameChange += GI_LEAPFRAMECHANGE;

		//catch sound
		if(GIFrameChange >= 1 && GIFrame == GIF_LEAP_RS + 7)
			playSound(-1, SND_CATCH, 0, GIX * 32);

		if(GIFrame >= GIF_LEAP_RS + 3 && GIFrame <= GIF_LEAP_RS + 7)
			GIXOffset += 3;

		if(GIFrame == GIF_LEAP_RS + 3)
			GIYOffset -= 1;

		if(GIFrame == GIF_LEAP_RS + 5)
			GIYOffset += 1;

		if(GIFrame == GIF_LEAP_RS + 6)
			GIYOffset += 2;

		if(GIFrame == GIF_LEAP_RS + 7)
			GIYOffset += 3;

		if(GIFrame >= GIF_LEAP_RS + 9)
		{
			GIXOffset += 1;
			GIYOffset -= 1;
		}

		if(GIFrame > GIF_LEAP_RE)
		{
			GIX += 2;
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
			GIXOffset = 0;
			GIYOffset = 0;
		}

		break;

	case GI_LEAPCATCHLEFT:
		GIFrameChange += GI_LEAPCATCHFRAMECHANGE;
		if(GIFrame > GIF_LEAPCATCH_LE)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
		}

		break;

	case GI_LEAPCATCHRIGHT:
		GIFrameChange += GI_LEAPCATCHFRAMECHANGE;
		if(GIFrame > GIF_LEAPCATCH_RE)
		{
			GIState = GI_STAND;
			GIFrame = GIF_STAND;
			GIFrameChange = 0;
		}

		break;
	}
}

#endif