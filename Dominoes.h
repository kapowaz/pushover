#ifndef __DOMINOES_H
#define __DOMINOES_H

void loadDominoImages(int set)
{
	int i;
	char filename[255] = "";

	static bool created = false;

	//DOMINOES------------------------
	//create a load of blank tiles
	if(!created)
	{
		for(i = 0; i < DOM_FRAMES; i++)
		{
			//SDL_FreeSurface(dominoes[i]);
			dominoes[i] = SDL_CreateRGBSurface(0, 72, 38, 32, 0, 0, 0, 0);
			SDL_SetColorKey(dominoes[i], SDL_SRCCOLORKEY, 0xFF00FF);
		}
	}

	//load the dominoes and draw them to the tiles
	sprintf(filename,"Resource\\Image\\Domino\\%i\\Domino.ishi",set);
	SDL_Surface *temp = IMG_Load(filename);

	int x = 0;
	int y = 0;
	for(i = 0; i < DOM_FRAMES; i++)
	{
		blit(temp, x, y, dominoes[i]);
		x -= 72;
		if(x == DOM_FPD * -72)
		{
			x = 0;
			y -= 38;
		}
	}

	SDL_FreeSurface(temp);

	//LADDER DOMINOES------------------
	//create a load of blank tiles
	if(!created)
	{
		for(i = 0; i < DOM_TYPES; i++)
		{
			//SDL_FreeSurface(ladderDominoes[i]);
			ladderDominoes[i] = SDL_CreateRGBSurface(0, 26, 37, 32, 0, 0, 0, 0);
			SDL_SetColorKey(ladderDominoes[i], SDL_SRCCOLORKEY, 0xFF00FF);
		}
	}

	//load the ladder dominoes and draw them to the blank tiles
	sprintf(filename,"Resource\\Image\\Domino\\%i\\Ladder.ishi",set);
	temp = IMG_Load(filename);

	for(i = 0; i < DOM_TYPES; i++)
	{
		blit(temp, i * -26, 0, ladderDominoes[i]);
	}

	SDL_FreeSurface(temp);

	//BARNEY --------------------------
	//create a load of blank tiles
	if(!created)
	{
		for(i = 0; i < 3; i++)
		{
			//SDL_FreeSurface(rubbleImg[i]);
			rubbleImg[i] = SDL_CreateRGBSurface(0, 32, 32, 32, 0, 0, 0, 0);
			SDL_SetColorKey(rubbleImg[i], SDL_SRCCOLORKEY, 0xFF00FF);
		}
	}

	//load the rubbles and draw them to the blank tiles
	sprintf(filename,"Resource\\Image\\Domino\\%i\\Rubble.ishi",set);
	temp = IMG_Load(filename);

	for(i = 0; i < 3; i++)
	{
		blit(temp, i * -32, 0, rubbleImg[i]);
	}

	SDL_FreeSurface(temp);

	created = true;
}

void initialiseDominoes()
{
	int x,y,i;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 2; i++)
			{
				//if(domino[x][y][i])
				//{
					domState[x][y][i] = STATE_STANDING;
					domFrame[x][y][i] = DOM_UPRIGHT;
					domFrameChange[x][y][i] = 0.0;
					domY[x][y][i] = 0.0;
					domDelay[x][y][i] = 0;
				//}
			}
		}
	}
}

//checks if the door should open or not
int levelComplete()
{
	int x,y,i;
	int y2, exempt;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 2; i++)
			{
				if(domino[x][y][i])
				{
					//domino is exempt from checks if it is about to go offscreen
					exempt = 1;
					if(domino[x][y][i] != D_TRIGGER && domino[x][y][i] != D_ASCENDER && domino[x][y][i] != D_ANTIGRAV)
					{
						for(y2 = y; y2 < MAPHEIGHT2; y2++)
						{
							if(ledge[x][y2])
								exempt = 0;
						}
					}
					if(domino[x][y][i] == D_ASCENDER)
					{
						for(y2 = y; y2 > -1; y2--)
						{
							if(ledge[x][y2])
								exempt = 0;
						}
					}
					//triggers must fall at the same time
					if(domino[x][y][i] == D_TRIGGER && domState[x][y][i] == STATE_STANDING)
					{
						exempt = 0;
					}

					if(!exempt)
					{
						//a domino is still standing upright (stoppers not included).
						if(domFrame[x][y][i] == DOM_UPRIGHT && domino[x][y][i] != D_STOPPER)
						{
							messageDelay = MESSAGEDELAY;
							messageDelayStyle = MSG_NOTALLTOPPLED;
							for(antEl = ants.first; antEl != NULL; NE(antEl))
							{
								antEl->data->GIShrugNeeded = true;
							}
							//MessageBox(NULL, "1", "1", MB_OK);
							return 0;
						}
						//a domino is still falling
						if(domFrameChange[x][y][i] != 0)
						{
							messageDelay = MESSAGEDELAY;
							messageDelayStyle = MSG_NOTALLTOPPLED;
							for(antEl = ants.first; antEl != NULL; NE(antEl))
							{
								antEl->data->GIShrugNeeded = true;
							}
							//char debug[255] = "";
							//sprintf(debug,"%i, %i, %i",x,y,i);
							//MessageBox(NULL, debug, "2", MB_OK);
							return 0;
						}
						//GI is still holding a domino
						for(antEl = ants.first; antEl != NULL; NE(antEl))
						{
							if(antEl->data->GIDomino > 0)
							{
								messageDelay = MESSAGEDELAY;
								messageDelayStyle = MSG_STILLHOLDING;
								return 0;
							}
						}
					}
				}
			}
			//rubble
			if(rubble[x][y])
			{
				messageDelay = MESSAGEDELAY;
				messageDelayStyle = MSG_CRASHED;
				for(antEl = ants.first; antEl != NULL; NE(antEl))
				{
					antEl->data->GIShrugNeeded = true;
				}
				return 0;
			}
		}
	}

	return 1;
}

void completeLevel()
{
	levelCompleteState = 1;
	levelState = LS_OPENEXIT;
	playSound(-1, SND_OPEN_DOOR, 0, 320);
}

void makeRubble(int x, int y, int newColour)
{
	int yellow = 0, red = 0;

	if(newColour == 1 || newColour == 2)
	{
		yellow = 1;
	}
	if(newColour == 2 || newColour == 3)
		red = 1;

	if(rubble[x][y] == 1 || rubble[x][y] == 2)
		yellow = 1;
	if(rubble[x][y] == 2 || rubble[x][y] == 3)
		red = 1;

	if(yellow && red)
		rubble[x][y] = 2;
	else if(yellow)
	{
		rubble[x][y] = 1;
	}
	else
		rubble[x][y] = 3;

	startEffect(x,y - 1,EFF_DUST);
	playSound(-1, SND_EXPLODER, 0, x * 32);
}

int playDominoSound(int channel, int domino, int loops, int x)
{
	switch(domino)
	{
	case D_TUMBLER:
		return playSound(channel, SND_REBOUND, loops, x);
	case D_ANTIGRAV:
		return playSound(channel, SND_REBOUND, loops, x);
	case D_TRIGGER:
		return playSound(channel, SND_TRIGGER, loops, x);
	case D_ASCENDER:
		return playSound(channel, SND_DOMINO_DROP, loops, x);
	case D_ROCKET:
		return playSound(channel, SND_DOMINO_DROP, loops, x);
	case D_COUNT1:
		return playSound(channel, SND_COUNT1, loops, x);
	case D_COUNT2:
		return playSound(channel, SND_COUNT2, loops, x);
	case D_COUNT3:
		return playSound(channel, SND_COUNT3, loops, x);
	case D_VANISHER:
		return playSound(channel, SND_VANISHER, loops, x);
	case D_DELAY2:
		return playSound(channel, SND_DELAY, loops, x);
	default:
		return playSound(channel, SND_DOMINO, loops, x);
	}
}

void splitSplitter(int x, int y, int i)
{
	//make two splitters instead
	domino[x][y][0] = D_SPLITTER1;
	domFrame[x][y][0] = DOM_UPRIGHT;
	domFrameChange[x][y][0] = 0.0;
	domState[x][y][0] = STATE_FALLLEFT;

	domino[x][y][1] = D_SPLITTER1;
	domFrame[x][y][1] = DOM_UPRIGHT;
	domFrameChange[x][y][1] = 0.0;
	//if(i == 0)
	//	domFrameChange[x][y][1] = DOM_FRAMECHANGESPEED;
	domState[x][y][1] = STATE_FALLRIGHT;

	playSound(-1, SND_SPLITTER, 0, x * 32);
}

void blowExploder(int x, int y, int i)
{
	startEffect(x,y - 1,EFF_EXPLOSION);

	domino[x][y][i] = 0;
	//ledge
	ledge[x][y] = 0;
	//ladders
	ladder[x][y] = 0;
	if(x > 0)
		if(ledge[x - 1][y])
			ladder[x - 1][y] = 0;
	if(x + 1 < MAPWIDTH)
		if(ledge[x + 1][y])
			ladder[x + 1][y] = 0;

	updateLedge();
}

void hitMimics()
{
	int x, y;
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(domino[x][y][0] == D_MIMIC)
			{
				if(mimics == 1)
				{
					domState[x][y][0] = STATE_FALLRIGHT;	
				}
				else
				{
					domState[x][y][0] = STATE_FALLLEFT;
				}
			}
		}
	}
	
}

void updateAllowedCount()
{
	int x,y,i;
	allowedCount = 3;
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 3; i++)
			{
				if(domState[x][y][i] == STATE_STANDING || domState[x][y][i] == STATE_PICKUP || domState[x][y][i] == STATE_PUTDOWN)
				{
					switch(domino[x][y][i])
					{
					case D_COUNT1:
						allowedCount = 1;
					case D_COUNT2:
						if(allowedCount > 1) allowedCount = 2;
					case D_COUNT3:
						if(allowedCount > 2) allowedCount = 3;
					}
				}
			}
		}
	}

	//check what GI's holding as well!!
	for(antEl = ants.first; antEl != NULL; NE(antEl))
	{
		switch(antEl->data->GIDomino)
		{
		case D_COUNT1:
			allowedCount = 1;
		case D_COUNT2:
			if(allowedCount > 1) allowedCount = 2;
		case D_COUNT3:
			if(allowedCount > 2) allowedCount = 3;
		}
	}
}

bool rebounder(int x,int y,int i)
{
	if(!starter)
	{
		if(domino[x][y][i] == D_STOPPER)
			return true;
		if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0)
			return true;
		//if(domino[x][y][i] == D_COUNT1 && allowedCount != 1)
		//	return true;
		if(domino[x][y][i] == D_COUNT2 && allowedCount != 2)
			return true;
		if(domino[x][y][i] == D_COUNT3 && allowedCount != 3)
			return true;

		return false;
	}
	else
	{
		if(domino[x][y][i] == D_STARTER)
			return false;

		return true;
	}
}

void processDominoes()
{
	int x,y,i,i2,i3;
	int b = 0;
	int completeCheck = 0;

	updateAllowedCount();

	//TELL YOU WHAT
	//let's confuse myself and process rubble here as well.
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(rubble[x][y] && !ledge[x][y])
			{
				rubbleY[x][y] += DOM_FALLSPEED;
				if(rubbleY[x][y] >= 16 && y + 1 < MAPHEIGHT2)
				{
					//lands on rubble!
					if(rubble[x][y + 1])
					{
						makeRubble(x,y + 1,rubble[x][y]);
						rubble[x][y] = 0;
					}
					else
					{
						//lands on domino!
						for(i = 0; i < 2; i++)
						{
							if(domino[x][y + 1][i])
							{
								if(domino[x][y + 1][i] == D_STANDARD)
									makeRubble(x, y, 0);
								else if(domino[x][y + 1][i] == D_STOPPER)
									makeRubble(x, y, 1);
								else
									makeRubble(x, y, 2);

								domino[x][y + 1][i] = 0;
							}
						}

						//normal move down a tile
						rubbleY[x][y + 1] = rubbleY[x][y] - 16 - DOM_FALLSPEED;
						rubbleY[x][y] = 0;
						rubble[x][y + 1] = rubble[x][y];
						rubble[x][y] = 0;

						startEffect(x,y,EFF_DUST);
					}
				}
				//falls off screen
				else if(rubbleY[x][y] > 48)
				{
					rubbleY[x][y] = 0;
					rubble[x][y] = 0;
				}
			}
			else
				rubbleY[x][y] = 0;
		}
	}

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			for(i = 0; i < 2; i++)
			{
				if(domino[x][y][i])
				{
					//set ascenders to the correct state
					if(domino[x][y][i] == D_ASCENDER)
					{
						if(domState[x][y][i] == STATE_FALLLEFT)
							domState[x][y][i] = STATE_ASCLEFT;
						else if(domState[x][y][i] == STATE_FALLRIGHT)
							domState[x][y][i] = STATE_ASCRIGHT;
					}

					//set rockets to the correct state
					if(domino[x][y][i] == D_ROCKET)
					{
						if(domState[x][y][i] == STATE_FALLLEFT || domState[x][y][i] == STATE_FALLRIGHT)
							domState[x][y][i] = STATE_ASCEND;
					}

					//change frame
					if(domFrameChange[x][y][i] <= -1.0 && domFrame[x][y][i] > 0)
					{
						domFrameChange[x][y][i] += 1.0;
						domFrame[x][y][i]--;
					}
					else if(domFrameChange[x][y][i] >= 1.0 && domFrame[x][y][i] < DOM_FPD - 1)
					{
						domFrameChange[x][y][i] -= 1.0;
						domFrame[x][y][i]++;
					}

					switch(domState[x][y][i])
					{
					case STATE_STANDING:
						//freefall!
						if(ledge[x][y] == 0)
						{
							if(domino[x][y][i] == D_ASCENDER)
							{
								domState[x][y][i] = STATE_ASCEND;
								break;
							}
							 
							domY[x][y][i] += DOM_FALLSPEED;
							//check whether to move down by a tile
							if(domY[x][y][i] >= TILEHEIGHT && y + 1 < MAPHEIGHT2)
							{
								//check if about to land on a splitter
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] == D_SPLITTER1 && domState[x][y + 1][i2] == STATE_STANDING)
									{
										domino[x][y][i] = 0;
										splitSplitter(x,y + 1,i);

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on a domino (splitters already handled)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] < 12)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][i2] == D_STANDARD)
										{
											makeRubble(x, y + 1, 1); //yellow
										}
										else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][i2] == D_STOPPER)
											makeRubble(x, y + 1, 3); //red
										else
											makeRubble(x, y + 1, 2); //both

										domino[x][y][i] = 0;
										domino[x][y + 1][0] = 0;
										domino[x][y + 1][1] = 0;
										
										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//collision with ascender (usually when dropped directly underneath one like in that japan level)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] > 0 && domFrame[x][y - 1][i2] == DOM_UPRIGHT && ledge[x][y - 1] == 0)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y - 1][i2] == D_STANDARD)
											makeRubble(x, y, 1); //yellow
										else if(domino[x][y][i] == D_STOPPER && domino[x][y - 1][i2] == D_STOPPER)
											makeRubble(x, y, 3); //red
										else
											makeRubble(x, y, 2); //both

										domino[x][y][i] = 0;
										domino[x][y - 1][0] = 0;
										domino[x][y - 1][1] = 0;

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on rubble
								if(rubble[x][y + 1])
								{
									if(domino[x][y][i] == D_STANDARD)
										makeRubble(x, y + 1, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER)
										makeRubble(x, y + 1, 3); //red
									else
										makeRubble(x, y + 1, 2); //both

									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									break;
								}

								//decide which layer to land on
								if(domino[x][y + 1][0] == 0)
									i2 = 0;
								else if(domino[x][y + 1][1] == 0)
									i2 = 1;
								else
								{
									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									
									if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][0] == D_STANDARD && domino[x][y + 1][1] == D_STANDARD)
										makeRubble(x, y, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][0] == D_STOPPER && domino[x][y + 1][1] == D_STOPPER)
										makeRubble(x, y, 3); //red
									else
										makeRubble(x, y, 2); //both

									makeRubble(x,y,1);
									break;
								}

								domino[x][y + 1][i2] = domino[x][y][i];
								domino[x][y][i] = 0;
								domY[x][y + 1][i2] = domino[x][y][i] - TILEHEIGHT - DOM_FALLSPEED;
								domState[x][y + 1][i2] = domState[x][y][i];
								domFrame[x][y + 1][i2] = domFrame[x][y][i];
								domFrameChange[x][y + 1][i2] = domFrameChange[x][y][i];

								//check whether it's just landed
								if(ledge[x][y + 1] > 0)
								{
									domY[x][y + 1][i2] = 0.0;
								}
							}
						}
						else
						{
							//get knocked over - from the left, fall right
							if(x > 0)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y][i2] > 0 && domFrame[x - 1][y][i2] >= 9 && domFrame[x - 1][y][i2] < DOM_FPD - 1 && domState[x - 1][y][i2] == STATE_FALLRIGHT)
									{
										if(!rebounder(x, y, i))
										{
											//if we're an exploder, boom
											if(domino[x][y][i] == D_EXPLODER)
											{
												//domino[x][y][i] = 0;
												//ledge[x][y] = 0;
												//updateLedge();
												blowExploder(x,y,i);
												playSound(-1, SND_EXPLODER, 0, x * 32);
												break;
											}

											//if we're a splitter, split
											if(domino[x][y][i] == D_SPLITTER1)
											{
												domino[x][y][i] = 0;
												splitSplitter(x,y,i);

												break;
											}

											//if we're a starter, cancel "starter mode" i.e. let other blocks fall over now
											if(domino[x][y][i] == D_STARTER)
											{
												starter = 0;
											}

											//if we're a mimic, knock the others over
											if(domino[x][y][i] == D_MIMIC)
											{
												mimics = 1;
											}
										}
										

										//if we're a stopper / delay / count, rebound the bastard
										//if(domino[x][y][i] == D_STOPPER || (domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0))
										if(rebounder(x,y,i))
										{
											domState[x - 1][y][i2] = STATE_FALLLEFT;

											//delay - start delay count
											if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0 && starter == 0)
											{
												domDelay[x][y][i] = DOM_DELAYCOUNT;
												//MessageBox(NULL,"Delay started","Message",MB_OK);
											}

											//cancel rebound if there are two blocks on the tile we're rebounding
											if(domino[x - 1][y][0] > 0 && domino[x - 1][y][1] > 0)
											{
												domState[x - 1][y][i2] = STATE_FALLRIGHT;
												domFrameChange[x - 1][y][i2] = 0.0;
												domFrame[x - 1][y][i2] = 10;
											}

											//cancel rebound if delay is half-delayed
											//if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] != DOM_DELAYCOUNT)
											//{
											//	domState[x - 1][y][i2] = STATE_FALLRIGHT;
											//}

											//cancel rebound if the block we're rebounding is being leant on
											if(x > 1)
											{
												for(i3 = 0; i3 < 2; i3++)
												{
													if(domino[x - 2][y][i3] > 0 && domFrame[x - 2][y][i3] > DOM_UPRIGHT)
													{
														domState[x - 1][y][i2] = STATE_FALLRIGHT;
														domFrameChange[x - 1][y][i2] = 0.0;
														domFrame[x - 1][y][i2] = 10;
													}
												}
											}

											if(domState[x - 1][y][i2] == STATE_FALLLEFT)
												playSound(-1, SND_REBOUND, 0, x * 32);
											else if(domDelay[x][y][i] == DOM_DELAYCOUNT)
												playSound(-1, SND_DELAY, 0, x * 32);
										}
										else
										{
											//otherwise (if not delay), get knocked over
											if(domino[x][y][i] != D_DELAY2 || domDelay[x][y][i] == 0)
											{
												playDominoSound(-1, domino[x][y][i], 0, x * 32);

												domState[x][y][i] = STATE_FALLRIGHT;
												domFrameChange[x][y][i] = 0;

												//if we're a counter, update the allowed list
												if(domino[x][y][i] == D_COUNT1 || domino[x][y][i] == D_COUNT2 || domino[x][y][i] == D_COUNT3)
													updateAllowedCount();
											}
										}
									}
								}
							}

							//get knocked over by ascender - from the left, fall right
							if(x > 0 && y > 1)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y - 1][i2] == D_ASCENDER && domState[x - 1][y - 1][i2] == STATE_ASCRIGHT && domFrame[x - 1][y - 1][i2] == 10)
									{
										if(!rebounder(x, y, i))
										{
											//if we're an exploder, boom
											if(domino[x][y][i] == D_EXPLODER)
											{
												//domino[x][y][i] = 0;
												//ledge[x][y] = 0;
												//updateLedge();
												blowExploder(x,y,i);
												playSound(-1, SND_EXPLODER, 0, x * 32);
												break;
											}

											//if we're a splitter, split
											if(domino[x][y][i] == D_SPLITTER1)
											{
												domino[x][y][i] = 0;
												splitSplitter(x,y,i);

												break;
											}

											//if we're a starter, cancel "starter mode" i.e. let other blocks fall over now
											if(domino[x][y][i] == D_STARTER)
											{
												starter = 0;
											}

											//if we're a mimic, knock the others over
											if(domino[x][y][i] == D_MIMIC)
											{
												mimics = 1;
											}
										}
										

										//if we're a stopper / delay / count, rebound the bastard
										//if(domino[x][y][i] == D_STOPPER || (domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0))
										if(rebounder(x,y,i))
										{
											domState[x - 1][y - 1][i2] = STATE_ASCLEFT;

											//delay - start delay count
											if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0 && starter == 0)
											{
												domDelay[x][y][i] = DOM_DELAYCOUNT;
												//MessageBox(NULL,"Delay started","Message",MB_OK);
											}

											//cancel rebound if there are two blocks on the tile we're rebounding
											//if(domino[x + 1][y][0] > 0 && domino[x + 1][y][1] > 0)
											//{
											//	domState[x + 1][y][i2] = STATE_FALLRIGHT;
											//}

											//cancel rebound if the block we're rebounding is being leant on
											if(x - 2 > 0)
											{
												for(i3 = 0; i3 < 2; i3++)
												{
													if(domino[x - 2][y - 1][i3] > 0 && domFrame[x - 2][y - 1][i3] > DOM_UPRIGHT)
													{
														//MessageBox(NULL, "a", "a", MB_OK);
														domState[x - 1][y - 1][i2] = STATE_ASCRIGHT;
														domFrameChange[x - 1][y - 1][i2] = 0;
														//domFrame[x - 1][y - 1][i2] = 9;
														break;
													}
												}
											}

											if(domState[x - 1][y - 1][i2] == STATE_ASCLEFT)
												playSound(-1, SND_REBOUND, 0, x * 32);
											else if(domDelay[x][y][i] == DOM_DELAYCOUNT)
												playSound(-1, SND_DELAY, 0, x * 32);
										}
										else
										{
											playDominoSound(-1, domino[x][y][i], 0, x * 32);

											domState[x][y][i] = STATE_FALLRIGHT;
											domFrameChange[x][y][i] = 0.0;
										}
									}
								}
							}

							//get knocked over - from the right, fall left
							if(x + 1 < MAPWIDTH)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y][i2] > 0 && domFrame[x + 1][y][i2] <= 3 && domFrame[x + 1][y][i2] > 0 && domState[x + 1][y][i2] == STATE_FALLLEFT)
									{
										if(!rebounder(x, y, i))
										{
											//if we're an exploder, boom
											if(domino[x][y][i] == D_EXPLODER)
											{
												//domino[x][y][i] = 0;
												//ledge[x][y] = 0;
												//updateLedge();
												blowExploder(x,y,i);
												playSound(-1, SND_EXPLODER, 0, x * 32);
												break;
											}

											//if we're a splitter, split
											if(domino[x][y][i] == D_SPLITTER1)
											{
												domino[x][y][i] = 0;
												splitSplitter(x,y,i);

												break;
											}

											//if we're a starter, cancel "starter mode" i.e. let other blocks fall over now
											if(domino[x][y][i] == D_STARTER)
											{
												starter = 0;
											}

											//if we're a mimic, knock the others over
											if(domino[x][y][i] == D_MIMIC)
											{
												mimics = -1;
											}
										}
										

										//if we're a stopper / delay / count, rebound the bastard
										//if(domino[x][y][i] == D_STOPPER || (domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0))
										if(rebounder(x,y,i))
										{
											domState[x + 1][y][i2] = STATE_FALLRIGHT;
											domFrameChange[x + 1][y][i2] -= DOM_FRAMECHANGESPEED;// * 2;

											//delay - start delay count
											if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0 && starter == 0)
											{
												domDelay[x][y][i] = -DOM_DELAYCOUNT;
												//MessageBox(NULL,"Delay started","Message",MB_OK);
											}

											//cancel rebound if there are two blocks on the tile we're rebounding
											if(domino[x + 1][y][0] > 0 && domino[x + 1][y][1] > 0)
											{
												domState[x + 1][y][i2] = STATE_FALLLEFT;
												//domFrameChange[x + 1][y][i2] += DOM_FRAMECHANGESPEED * 2;
												domFrameChange[x + 1][y][i2] = 0.0;
												//MessageBox(NULL, ":O", ":O", MB_OK);
											}

											//cancel rebound if delay is half-delayed
											//if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] != DOM_DELAYCOUNT)
											//{
											//	domState[x + 1][y][i2] = STATE_FALLLEFT;
											//	domFrameChange[x + 1][y][i2] += DOM_FRAMECHANGESPEED;
											//}

											//cancel rebound if the block we're rebounding is being leant on
											if(x + 2 < MAPWIDTH)
											{
												for(i3 = 0; i3 < 2; i3++)
												{
													if(domino[x + 2][y][i3] > 0 && domFrame[x + 2][y][i3] < DOM_UPRIGHT)
													{
														domState[x + 1][y][i2] = STATE_FALLLEFT;
														domFrameChange[x + 1][y][i2] = 0.0;
														//domFrameChange[x + 1][y][i2] += DOM_FRAMECHANGESPEED * 2;
													}
												}
											}

											if(domState[x + 1][y][i2] == STATE_FALLRIGHT)
												playSound(-1, SND_REBOUND, 0, x * 32);
											else if(domDelay[x][y][i] == -DOM_DELAYCOUNT)
												playSound(-1, SND_DELAY, 0, x * 32);
										}
										else
										{
											//otherwise (if not delay), get knocked over
											if(domino[x][y][i] != D_DELAY2 || domDelay[x][y][i] == 0)
											{
												playDominoSound(-1, domino[x][y][i], 0, x * 32);

												domState[x][y][i] = STATE_FALLLEFT;
												domFrameChange[x][y][i] = -DOM_FRAMECHANGESPEED;
											}
										}
									}
								}
							}

							//get knocked over by ascender - from the right, fall left
							if(x + 1 < MAPWIDTH && y > 0)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y - 1][i2] == D_ASCENDER && domState[x + 1][y - 1][i2] == STATE_ASCLEFT && domFrame[x + 1][y - 1][i2] == 2)
									{
										if(!rebounder(x, y, i))
										{
											//if we're an exploder, boom
											if(domino[x][y][i] == D_EXPLODER)
											{
												//domino[x][y][i] = 0;
												//ledge[x][y] = 0;
												//updateLedge();
												blowExploder(x,y,i);
												playSound(-1, SND_EXPLODER, 0, x * 32);
												break;
											}

											//if we're a splitter, split
											if(domino[x][y][i] == D_SPLITTER1)
											{
												domino[x][y][i] = 0;
												splitSplitter(x,y,i);

												break;
											}

											//if we're a starter, cancel "starter mode" i.e. let other blocks fall over now
											if(domino[x][y][i] == D_STARTER)
											{
												starter = 0;
											}

											//if we're a mimic, knock the others over
											if(domino[x][y][i] == D_MIMIC)
											{
												mimics = -1;
											}
										}
										

										//if we're a stopper / delay / count, rebound the bastard
										//if(domino[x][y][i] == D_STOPPER || (domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0))
										if(rebounder(x,y,i))
										{
											domState[x + 1][y - 1][i2] = STATE_ASCRIGHT;

											//delay - start delay count
											if(domino[x][y][i] == D_DELAY2 && domDelay[x][y][i] == 0 && starter == 0)
											{
												domDelay[x][y][i] = -DOM_DELAYCOUNT;
												//MessageBox(NULL,"Delay started","Message",MB_OK);
											}

											//cancel rebound if there are two blocks on the tile we're rebounding
											//if(domino[x + 1][y][0] > 0 && domino[x + 1][y][1] > 0)
											//{
											//	domState[x + 1][y][i2] = STATE_FALLRIGHT;
											//}

											//cancel rebound if the block we're rebounding is being leant on
											if(x + 3 < MAPWIDTH)
											{
												for(i3 = 0; i3 < 2; i3++)
												{
													if(domino[x + 2][y - 1][i3] > 0 && domFrame[x + 2][y - 1][i3] < DOM_UPRIGHT)
													{
														//MessageBox(NULL, "a", "a", MB_OK);
														domState[x + 1][y - 1][i2] = STATE_ASCLEFT;
														domFrameChange[x + 1][y - 1][i2] = 0;
														//domFrame[x + 1][y - 1][i2] = 9;
														break;
													}
												}
											}

											if(domState[x + 1][y - 1][i2] == STATE_ASCRIGHT)
												playSound(-1, SND_REBOUND, 0, x * 32);
											else if(domDelay[x][y][i] == -DOM_DELAYCOUNT)
												playSound(-1, SND_DELAY, 0, x * 32);
										}
										else
										{
											playDominoSound(-1, domino[x][y][i], 0, x * 32);

											domState[x][y][i] = STATE_FALLLEFT;
											domFrameChange[x][y][i] = -DOM_FRAMECHANGESPEED;
										}
									}
								}
							}

							//delay count
							if((domino[x][y][i] == D_DELAY2 || domino[x][y][i] == D_DELAY1) && domDelay[x][y][i] > 0)
							{
								domDelay[x][y][i] -= 1;

								//char debug[255] = "";
								//sprintf(debug,"%i",domDelay[x][y][i]);
								//MessageBox(NULL, debug, "domDelay", MB_OK);

								if(domDelay[x][y][i] == 0)
								{
									domState[x][y][i] = STATE_FALLRIGHT;
								}
							}

							if((domino[x][y][i] == D_DELAY2 || domino[x][y][i] == D_DELAY1) && domDelay[x][y][i] < 0)
							{
								domDelay[x][y][i] += 1;
								if(domDelay[x][y][i] == 0)
								{
									domState[x][y][i] = STATE_FALLLEFT;
								}
							}
						}

						break;

					case STATE_FALLLEFT:
						//off edge of screen
						if(x == 0 && domFrame[x][y][i] < DOM_UPRIGHT)
						{
							domino[x][y][i] = 0;
							break;
						}

						//decrease frame
						if(x + 1 < MAPWIDTH && y + 1 < MAPHEIGHT2 && ledge[x][y] && ledge[x + 1][y - 1])
						{
							//go faster on steps
							domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED * DOM_STEPSPEEDMOD;
						}
						else
						{
							if(ledge[x][y] > 0 || domino[x][y][i] == D_ANTIGRAV)
							{
								if(x > 0)
									if((domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV) && domino[x - 1][y][i] == 0)
										domFrameChange[x][y][i] -= DOM_TUMBLERFRAMECHANGESPEED;
									else
										domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED;
								else
									domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED;
							}
							
							if(domFrame[x][y][i] > DOM_UPRIGHT)
							{
								if(ledge[x][y] == 0 && domino[x][y][i] != D_ANTIGRAV)
									domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED;
								else
								{
									if(domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV)
										domFrameChange[x][y][i] -= DOM_TUMBLERFRAMECHANGESPEED;
								}
							}
						}

						//mega delay on steps
						if(domFrame[x][y][i] == DOM_UPRIGHT && domDelay[x][y][i] != 0)
						{
							domState[x][y][i] = STATE_STANDING;
							domFrameChange[x][y][i] = 0;
						}

						//don't allow block (probably tumbler) to rise if something is leaning on it
						if(domFrame[x][y][i] > DOM_UPRIGHT)
						{
							if(x > 0)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y][i2] > 0 && domFrame[x - 1][y][i2] > DOM_UPRIGHT && (ledge[x][y] || domino[x][y][i] == D_ANTIGRAV))
									{
										domFrameChange[x][y][i] = 0.0;
										if(domFrame[x][y][i] < DOM_FPD - 1)
											domFrame[x][y][i]++;
									}
								}
							}
						}

						//both blocks on this tile fall the same way - rubble!
						if(domFrame[x][y][i] < DOM_UPRIGHT)
						{
							if(domino[x][y][1 - i] && domFrame[x][y][1 - i] < DOM_UPRIGHT)
							{
								if(domino[x][y][i] == D_STANDARD && domino[x][y][1 - i])
									makeRubble(x, y, 1);
								else if(domino[x][y][i] == D_STOPPER && domino[x][y][1 - i] == D_STOPPER)
									makeRubble(x, y, 3);
								else
									makeRubble(x, y ,2);

								domino[x][y][i] = 0;
								domino[x][y][1 - i] = 0;
							}
						}

						//bad collision with the tile next to it - rubble!
						if(x > 0)
						{
							if(domFrame[x][y][i] < 1 || (domFrame[x][y][i] < 3 && domino[x][y][i] != D_VANISHER))
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y][i2] && domState[x - 1][y][i2] == STATE_FALLRIGHT && domFrame[x - 1][y][i2] > DOM_UPRIGHT + 2)
									{
										//MessageBox(NULL,"pwn","pwn",MB_OK);

										if(domino[x][y][i] == D_STANDARD)
											makeRubble(x, y, 1);
										else if(domino[x][y][i] == D_STOPPER)
											makeRubble(x, y, 3);
										else
											makeRubble(x, y ,2);

										domino[x][y][i] = 0;
									}
								}
							}
						}

						//no ledge beneath, fall!
						if((ledge[x][y] == 0 && domino[x][y][i] != D_ANTIGRAV) && domFrame[x][y][i] < 12)
						{
							//fix the thing where a hole gets blown beneath a fallen domino
							if(domFrame[x][y][i] < DOM_UPRIGHT) domState[x][y][i] = STATE_FALLRIGHT;
							
							domY[x][y][i] += DOM_FALLSPEED;
							//check whether to move down by a tile
							if(domY[x][y][i] >= TILEHEIGHT && y + 1 < MAPHEIGHT2)
							{
								//check if about to land on a splitter
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] == D_SPLITTER1 && domState[x][y + 1][i2] == STATE_STANDING)
									{
										domino[x][y][i] = 0;
										splitSplitter(x,y + 1,i);

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on a domino (splitters already handled)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] < 12)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][i2] == D_STANDARD)
											makeRubble(x, y + 1, 1); //yellow
										else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][i2] == D_STOPPER)
											makeRubble(x, y + 1, 3); //red
										else
											makeRubble(x, y + 1, 2); //both

										domino[x][y][i] = 0;
										domino[x][y + 1][0] = 0;
										domino[x][y + 1][1] = 0;

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//collision with ascender (usually when dropped directly underneath one like in that japan level)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] > 0 && domFrame[x][y - 1][i2] == DOM_UPRIGHT && ledge[x][y - 1] == 0)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y - 1][i2] == D_STANDARD)
											makeRubble(x, y, 1); //yellow
										else if(domino[x][y][i] == D_STOPPER && domino[x][y - 1][i2] == D_STOPPER)
											makeRubble(x, y, 3); //red
										else
											makeRubble(x, y, 2); //both

										domino[x][y][i] = 0;
										domino[x][y - 1][0] = 0;
										domino[x][y - 1][1] = 0;

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on rubble
								if(rubble[x][y + 1])
								{
									if(domino[x][y][i] == D_STANDARD)
										makeRubble(x, y + 1, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER)
										makeRubble(x, y + 1, 3); //red
									else
										makeRubble(x, y + 1, 2); //both

									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									break;
								}

								//decide which layer to land on
								if(domino[x][y + 1][0] == 0)
									i2 = 0;
								else if(domino[x][y + 1][1] == 0)
									i2 = 1;
								else
								{
									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									
									if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][0] == D_STANDARD && domino[x][y + 1][1] == D_STANDARD)
										makeRubble(x, y, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][0] == D_STOPPER && domino[x][y + 1][1] == D_STOPPER)
										makeRubble(x, y, 3); //red
									else
										makeRubble(x, y, 2); //both

									makeRubble(x,y,1);
									break;
								}

								domino[x][y + 1][i2] = domino[x][y][i];
								domino[x][y][i] = 0;
								domY[x][y + 1][i2] = domino[x][y][i] - TILEHEIGHT - DOM_FALLSPEED;
								domState[x][y + 1][i2] = domState[x][y][i];
								domFrame[x][y + 1][i2] = domFrame[x][y][i];
								domFrameChange[x][y + 1][i2] = domFrameChange[x][y][i];
								domDelay[x][y + 1][i2] = domDelay[x][y][i];

								//check whether it's just landed
								if(ledge[x][y + 1] > 0)
								{
									domY[x][y + 1][i2] = 0.0;
								}
							}
							else if(domY[x][y][i] >= 64)
							{
								//fallen off screen - delete
								domino[x][y][i] = 0;
							}
						}

						//can't fall all the way - block in the way to the left
						if(domFrame[x][y][i] == 1)
						{
							if(x > 0)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y][i2] > 0)
									{
										//if we're a vanisher, disappear here
										if(domino[x][y][i] == D_VANISHER)
										{
											domino[x][y][i] = 0;
											break;
										}

										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 2 - block two tiles left is in the way
						if(domFrame[x][y][i] == 1)
						{
							if(x > 1)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 2][y][i2] > 0 && domFrame[x - 2][y][i2] >= 10)
									{
										//if we're a vanisher, disappear here
										if(domino[x][y][i] == D_VANISHER)
										{
											domino[x][y][i] = 0;
											break;
										}

										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 3 - standing block in the way to the left
						if(domFrame[x][y][i] == 2 || (domFrame[x][y][i] == 3 && domFrameChange[x][y][i] < 0))
						{
							if(x > 0)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x - 1][y][i2] > 0 && domFrame[x - 1][y][i2] == DOM_UPRIGHT)
									{
										//if we're a vanisher, disappear here
										//if(domino[x][y][i] == D_VANISHER)
										//{
										//	domino[x][y][i] = 0;
										//	break;
										//}

										domFrame[x][y][i] = 2;
										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 4 - bit of ledge (step) in the way
						if(domFrame[x][y][i] == 2)
						{
							if(x > 0 && y > 0)
							{
								if(ledge[x - 1][y - 1] > 0)
								{
									//if we're a vanisher, disappear here
									//if(domino[x][y][i] == D_VANISHER)
									//{
									//	domino[x][y][i] = 0;
									//	break;
									//}

									domFrameChange[x][y][i] = 0.0;
								}
							}
						}

						//can't fall all the way 5 - rubble in the way - left
						if(domFrame[x][y][i] == 2)
						{
							if(x > 0)
							{
								if(rubble[x - 1][y] > 0)
								{
									//if we're a vanisher, disappear here
									//if(domino[x][y][i] == D_VANISHER)
									//{
									//	domino[x][y][i] = 0;
									//	break;
									//}

									domFrameChange[x][y][i] = 0.0;
								}
							}
						}

						//have fallen flat
						if(domFrame[x][y][i] == 0)
						{
							domFrameChange[x][y][i] = 0.0;

							//if we're a vanisher, disappear here
							if(domino[x][y][i] == D_VANISHER)
							{
								domino[x][y][i] = 0;
								break;
							}

							if(x > 0)
							{
								//if we're a bridger, bridge?
								if(domino[x][y][i] == D_BRIDGER && x - 1 > 0)
								{
									if(ledge[x - 1][y] == 0 && ledge[x - 2][y] > 0)
									{
										domino[x][y][i] = 0;
										ledge[x - 1][y] = 1;
										updateLedge();
										playSound(-1, SND_BRIDGER, 0, x * 32);
									}
								}

								//no ledge or we're a tumbler
								if(ledge[x - 1][y] == 0 || domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV)
								{
									//move block to the next tile left
									int moveTo = 0;
									if(domino[x - 1][y][0] > 0)
										moveTo = 1;

									domino[x - 1][y][moveTo] = domino[x][y][i];
									domino[x][y][i] = 0;

									domState[x - 1][y][moveTo] = STATE_FALLLEFT;
									domFrame[x - 1][y][moveTo] = 12;
									domFrameChange[x - 1][y][moveTo] = domFrameChange[x][y][i] - (DOM_FRAMECHANGESPEED * 2);//0.0;
									//sync left and right tumblers
									if((domino[x - 1][y][moveTo] == D_TUMBLER || domino[x - 1][y][moveTo] == D_ANTIGRAV) && ledge[x - 1][y])
									{
										//MessageBox(NULL,"","",MB_OK);
										domFrameChange[x - 1][y][moveTo] = -DOM_TUMBLERFRAMECHANGESPEED;
									}
									domY[x - 1][y][i] = 0.0;

									//flip splitters & delays
									if(domino[x - 1][y][moveTo] == D_DELAY1)
										domino[x - 1][y][moveTo] = D_DELAY2;
									else if(domino[x - 1][y][moveTo] == D_DELAY2)
										domino[x - 1][y][moveTo] = D_DELAY1;
									else if(domino[x - 1][y][moveTo] == D_SPLITTER1)
										domino[x - 1][y][moveTo] = D_SPLITTER2;
									else if(domino[x - 1][y][moveTo] == D_SPLITTER2)
										domino[x - 1][y][moveTo] = D_SPLITTER1;

									//fall sound
									if(ledge[x - 1][y] == 0 && ledge[x - 1][y + 1] == 0 && domino[x - 1][y][moveTo] != D_ANTIGRAV)
									{
										playSound(-1, SND_DOMINO_DROP, 0, x * 32);
									}
									else if(domino[x - 1][y][moveTo] == D_DELAY1 || domino[x - 1][y][moveTo] == D_DELAY2)
									{
										domDelay[x - 1][y][moveTo] = -DOM_STEPDELAYCOUNT;
									}

									break;
								}
							}

							//trigger - check if complete!
							if(domino[x][y][i] == D_TRIGGER)
							{
								completeCheck = 1;
							}
						}

						break;

					case STATE_FALLRIGHT:
						//off edge of screen
						if(x == MAPWIDTH && domFrame[x][y][i] > DOM_UPRIGHT)
						{
							domino[x][y][i] = 0;
							break;
						}

						//increase frame
						if(x > 0 && y > 0 && ledge[x][y] && ledge[x - 1][y - 1])
						{
							//go faster on steps
							domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED * DOM_STEPSPEEDMOD;
						}
						else
						{
							if(ledge[x][y] > 0 || domino[x][y][i] == D_ANTIGRAV)
							{
								if(x + 1 < MAPWIDTH)
									if((domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV) && domino[x + 1][y][i] == 0)
										domFrameChange[x][y][i] += DOM_TUMBLERFRAMECHANGESPEED;
									else
										domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED;
								else
									domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED;
							}
							
							if(domFrame[x][y][i] < DOM_UPRIGHT)
							{
								if(ledge[x][y] == 0)
									domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED;
								else
								{
									if(domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV)
										domFrameChange[x][y][i] += DOM_TUMBLERFRAMECHANGESPEED;
								}
							}
						}

						//mega delay on steps
						if(domFrame[x][y][i] == DOM_UPRIGHT && domDelay[x][y][i] != 0)
						{
							domState[x][y][i] = STATE_STANDING;
							domFrameChange[x][y][i] = 0;
						}

						//don't allow block (probably tumbler) to rise if something is leaning on it
						if(domFrame[x][y][i] < DOM_UPRIGHT)
						{
							if(x + 1 < MAPWIDTH)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y][i2] > 0 && domFrame[x + 1][y][i2] < DOM_UPRIGHT && (ledge[x][y] || domino[x][y][i] == D_ANTIGRAV))
									{
										domFrameChange[x][y][i] = 0.0;
										if(domFrame[x][y][i] > 0)
											domFrame[x][y][i]--;
									}
								}
							}
						}

						//both blocks on this tile fall the same way - rubble!
						if(domFrame[x][y][i] > DOM_UPRIGHT)
						{
							if(domino[x][y][1 - i] && domFrame[x][y][1 - i] > DOM_UPRIGHT)
							{
								if(domino[x][y][i] == D_STANDARD && domino[x][y][1 - i])
									makeRubble(x, y, 1);
								else if(domino[x][y][i] == D_STOPPER && domino[x][y][1 - i] == D_STOPPER)
									makeRubble(x, y, 3);
								else
									makeRubble(x, y ,2);

								domino[x][y][i] = 0;
								domino[x][y][1 - i] = 0;
							}
						}

						//commented out, cos it gets handled in STATE_FALLLEFT for the other block.
						//bad collision with the tile next to it - rubble!
						/*
						if(x + 1 < MAPWIDTH)
						{
							if(domFrame[x][y][i] > DOM_UPRIGHT + 2)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y][i2] && domState[x + 1][y][i2] == STATE_FALLLEFT && domFrame[x + 1][y][i] < DOM_UPRIGHT - 2)
									{
										MessageBox(NULL,"pwn","pwn",MB_OK);
										makeRubble(x, y, 1);
										domino[x][y][i] = 0;
									}
								}
							}
						}
						*/

						//no ledge beneath, fall!
						if((ledge[x][y] == 0 && domino[x][y][i] != D_ANTIGRAV) && domFrame[x][y][i] > 0)
						{
							//fix the thing where a hole gets blown beneath a fallen domino
							if(domFrame[x][y][i] > DOM_UPRIGHT) domState[x][y][i] = STATE_FALLLEFT;

							domY[x][y][i] += DOM_FALLSPEED;
							//check whether to move down by a tile
							if(domY[x][y][i] >= TILEHEIGHT && y + 1 < MAPHEIGHT2)
							{
								//check if about to land on a splitter
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] == D_SPLITTER1 && domState[x][y + 1][i2] == STATE_STANDING)
									{
										domino[x][y][i] = 0;
										splitSplitter(x,y + 1,i);

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on a domino (splitters already handled)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] > 0 && domFrame[x][y + 1][i2] < 12)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][i2] == D_STANDARD)
											makeRubble(x, y + 1, 1); //yellow
										else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][i2] == D_STOPPER)
											makeRubble(x, y + 1, 3); //red
										else
											makeRubble(x, y + 1, 2); //both

										domino[x][y][i] = 0;
										domino[x][y + 1][0] = 0;
										domino[x][y + 1][1] = 0;

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//collision with ascender (usually when dropped directly underneath one like in that japan level)
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] > 0 && domFrame[x][y - 1][i2] == DOM_UPRIGHT && ledge[x][y - 1] == 0)
									{
										if(domino[x][y][i] == D_STANDARD && domino[x][y - 1][i2] == D_STANDARD)
											makeRubble(x, y, 1); //yellow
										else if(domino[x][y][i] == D_STOPPER && domino[x][y - 1][i2] == D_STOPPER)
											makeRubble(x, y, 3); //red
										else
											makeRubble(x, y, 2); //both

										domino[x][y][i] = 0;
										domino[x][y - 1][0] = 0;
										domino[x][y - 1][1] = 0;

										b = 1;
										break;
									}
								}
								if(b) break;

								//make rubbleorama
								//falls on rubble
								if(rubble[x][y + 1])
								{
									if(domino[x][y][i] == D_STANDARD)
										makeRubble(x, y + 1, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER)
										makeRubble(x, y + 1, 3); //red
									else
										makeRubble(x, y + 1, 2); //both

									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									break;
								}

								//decide which layer to land on
								if(domino[x][y + 1][0] == 0)
									i2 = 0;
								else if(domino[x][y + 1][1] == 0)
									i2 = 1;
								else
								{
									domino[x][y][i] = 0;
									domino[x][y + 1][0] = 0;
									domino[x][y + 1][1] = 0;
									
									if(domino[x][y][i] == D_STANDARD && domino[x][y + 1][0] == D_STANDARD && domino[x][y + 1][1] == D_STANDARD)
										makeRubble(x, y, 1); //yellow
									else if(domino[x][y][i] == D_STOPPER && domino[x][y + 1][0] == D_STOPPER && domino[x][y + 1][1] == D_STOPPER)
										makeRubble(x, y, 3); //red
									else
										makeRubble(x, y, 2); //both

									makeRubble(x,y,1);
									break;
								}

								domino[x][y + 1][i2] = domino[x][y][i];
								domino[x][y][i] = 0;
								domY[x][y + 1][i2] = domino[x][y][i] - TILEHEIGHT - DOM_FALLSPEED;
								domState[x][y + 1][i2] = domState[x][y][i];
								domFrame[x][y + 1][i2] = domFrame[x][y][i];
								domFrameChange[x][y + 1][i2] = domFrameChange[x][y][i];
								domDelay[x][y + 1][i2] = domDelay[x][y][i];

								//check whether it's just landed
								if(ledge[x][y + 1] > 0)
								{
									domY[x][y + 1][i2] = 0.0;
								}
							}
							else if(domY[x][y][i] >= 64)
							{
								//fallen off screen - delete
								domino[x][y][i] = 0;
							}
						}

						//can't fall all the way - block in the way to the right
						if(domFrame[x][y][i] == 11)
						{
							if(x + 1 < MAPWIDTH)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y][i2] > 0)
									{
										//if we're a vanisher, disappear here
										if(domino[x][y][i] == D_VANISHER)
										{
											domino[x][y][i] = 0;
											break;
										}

										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 2 - block two tiles right is in the way
						if(domFrame[x][y][i] == 11)
						{
							if(x + 2 < MAPWIDTH)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 2][y][i2] > 0 && domFrame[x + 2][y][i2] <= 2)
									{
										//if we're a vanisher, disappear here
										if(domino[x][y][i] == D_VANISHER)
										{
											domino[x][y][i] = 0;
											break;
										}

										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 3 - standing block in the way to the right
						if(domFrame[x][y][i] == 10 || (domFrame[x][y][i] == 11 && domFrameChange[x][y][i] > 0))
						{
							if(x + 1 < MAPWIDTH)
							{
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x + 1][y][i2] > 0 && domFrame[x + 1][y][i2] == DOM_UPRIGHT)
									{
										//if we're a vanisher, disappear here
										//if(domino[x][y][i] == D_VANISHER)
										//{
										//	domino[x][y][i] = 0;
										//	break;
										//}

										//domFrame[x][y][i] = 11;
										domFrameChange[x][y][i] = 0.0;
									}
								}
							}
						}

						//can't fall all the way 4 - bit of ledge (step) in the way
						if(domFrame[x][y][i] == 10)
						{
							if(x + 1 < MAPWIDTH && y > 0)
							{
								if(ledge[x + 1][y - 1] > 0)
								{
									//if we're a vanisher, disappear here
									//if(domino[x][y][i] == D_VANISHER)
									//{
									//	domino[x][y][i] = 0;
									//	break;
									//}

									domFrameChange[x][y][i] = 0.0;
								}
							}
						}

						//can't fall all the way 5 - rubble in the way - right
						if(domFrame[x][y][i] >= 10)
						{
							if(x + 1 < MAPWIDTH) 
							{
								if(rubble[x + 1][y] > 0)
								{
									//if we're a vanisher, disappear here
									//if(domino[x][y][i] == D_VANISHER)
									//{
									//	domino[x][y][i] = 0;
									//	break;
									//}

									domFrameChange[x][y][i] = 0.0;
									domFrame[x][y][i] = 10;
								}
							}
						}

						//have fallen flat
						if(domFrame[x][y][i] == 12)
						{
							domFrameChange[x][y][i] = 0.0;

							//if we're a vanisher, disappear here
							if(domino[x][y][i] == D_VANISHER)
							{
								domino[x][y][i] = 0;
								break;
							}
							
							if(x + 1 < MAPWIDTH)
							{
								//if we're a bridger, bridge?
								if(domino[x][y][i] == D_BRIDGER && x + 2 < MAPWIDTH)
								{
									if(ledge[x + 1][y] == 0 && ledge[x + 2][y] > 0)
									{
										domino[x][y][i] = 0;
										ledge[x + 1][y] = 1;
										updateLedge();
										playSound(-1, SND_BRIDGER, 0, x * 32);
									}
								}

								//no ledge or we're a tumbler
								if(ledge[x + 1][y] == 0 || domino[x][y][i] == D_TUMBLER || domino[x][y][i] == D_ANTIGRAV)
								{
									//move block to the next tile right
									int moveTo = 0;
									if(domino[x + 1][y][0] > 0)
										moveTo = 1;

									domino[x + 1][y][moveTo] = domino[x][y][i];
									domino[x][y][i] = 0;

									domState[x + 1][y][moveTo] = STATE_FALLRIGHT;
									domFrame[x + 1][y][moveTo] = 0;
									domFrameChange[x + 1][y][moveTo] = domFrameChange[x][y][i] + DOM_FRAMECHANGESPEED;
									//sync left and right tumblers
									if((domino[x + 1][y][moveTo] == D_TUMBLER || domino[x + 1][y][moveTo] == D_ANTIGRAV) && ledge[x + 1][y])
									{
										//MessageBox(NULL,"","",MB_OK);
										domFrameChange[x + 1][y][moveTo] = -DOM_TUMBLERFRAMECHANGESPEED;
									}
									domY[x + 1][y][moveTo] = 0.0;

									//flip splitters & delays
									if(domino[x + 1][y][moveTo] == D_DELAY1)
										domino[x + 1][y][moveTo] = D_DELAY2;
									else if(domino[x + 1][y][moveTo] == D_DELAY2)
										domino[x + 1][y][moveTo] = D_DELAY1;
									else if(domino[x + 1][y][moveTo] == D_SPLITTER1)
										domino[x + 1][y][moveTo] = D_SPLITTER2;
									else if(domino[x + 1][y][moveTo] == D_SPLITTER2)
										domino[x + 1][y][moveTo] = D_SPLITTER1;

									//fall sound
									if((ledge[x + 1][y] == 0 && domino[x + 1][y][moveTo] != D_ANTIGRAV) && ledge[x + 1][y + 1] == 0)
									{
										playSound(-1, SND_DOMINO_DROP, 0, x * 32);
									}
									else if(domino[x + 1][y][moveTo] == D_DELAY1 || domino[x + 1][y][moveTo] == D_DELAY2)
									{
										domDelay[x + 1][y][moveTo] = DOM_STEPDELAYCOUNT;
									}

									break;
								}
							}

							//trigger - check if complete!
							if(domino[x][y][i] == D_TRIGGER)
							{
								completeCheck = 1;
							}
						}

						break;

					case STATE_ASCLEFT:
						if(y > 2)
						{
							//decrease frame
							if(ledge[x][y - 3] > 0)
								domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED;
							
							if(domFrame[x][y][i] > DOM_UPRIGHT && ledge[x][y - 3] == 0)
								domFrameChange[x][y][i] -= DOM_FRAMECHANGESPEED;

							//rise if no ledge above
							if(ledge[x][y - 3] == 0)
							{
								domY[x][y][i] -= DOM_ASCENDSPEED;

								//rubble!
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] || domino[x][y - 2][i2])
									{
										domino[x][y - 0][i] = 0;
										domino[x][y - 1][i2] = 0;
										domino[x][y - 2][i2] = 0;
										makeRubble(x, y - 3, 2);
									}
								}

								//move up a tile
								if(domY[x][y][i] <= -16.0)
								{
									domino[x][y - 1][i] = domino[x][y][i];
									domino[x][y][i] = 0;

									domY[x][y - 1][i] = domY[x][y][i] + 16.0;
									domFrame[x][y - 1][i] = domFrame[x][y][i];
									domFrameChange[x][y - 1][i] = domFrameChange[x][y][i];
									domState[x][y - 1][i] = domState[x][y][i];

									break;
								}
							}
							else
								domY[x][y][i] = 0;

							//can't ascend all the way - block in the way to the left
							if(domFrame[x][y][i] == 1)
							{
								if(x > 0)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//ascender next to it
										if(domino[x - 1][y][i2] > 0)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//can't ascend all the way 2 - standing block in the way to the left
							if(domFrame[x][y][i] == 2)
							{
								if(x > 0)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//ascender next to it
										//if(domino[x + 1][y][i2] > 0)
										//{
										//	domFrameChange[x][y][i] = 0.0;
										//}

										//something standing up, one tile down
										if(domino[x - 1][y + 1][i2] > 0 && domFrame[x - 1][y + 1][i2] == DOM_UPRIGHT)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//can't ascend all the way 3 - block two tiles to the left is leaning right
							if(domFrame[x][y][i] == 1)
							{
								if(x - 2 > 0)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//block leaning right
										if(domino[x - 2][y][i2] > 0 && domFrame[x - 2][y][i2] >= 11)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//have fallen flat
							if(domFrame[x][y][i] == 0)
							{
								domFrameChange[x][y][i] = 0.0;
								//move a tile left if there's no ledge there
								//so the ascender can flip up
								if(x > 0)
								{
									if(ledge[x - 1][y - 3] == 0)
									{
										domino[x - 1][y][i] = domino[x][y][i];
										domino[x][y][i] = 0;

										domFrame[x - 1][y][i] = 12;
										domFrameChange[x - 1][y][i] = 0.0;
										domState[x - 1][y][i] = domState[x][y][i];
										domY[x - 1][y][i] = 0;

										break;
									}
								}

								//OR, there could be no ledge where the ascender actually is
								//in which case, make it flip the other way
								if(ledge[x][y - 3] == 0)
								{
									domState[x][y][i] = STATE_ASCRIGHT;
									break;
								}
							}
						}
						else
						{
							domY[x][y][i] -= DOM_ASCENDSPEED;
							if(domY[x][y][i] < -48)
								domino[x][y][i] = 0;
						}

						break;

					case STATE_ASCRIGHT:
						if(y > 2)
						{
							//increase frame
							if(ledge[x][y - 3] > 0)
								domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED;
							
							if(domFrame[x][y][i] < DOM_UPRIGHT && ledge[x][y - 3] == 0)
								domFrameChange[x][y][i] += DOM_FRAMECHANGESPEED;

							//rise if no ledge above
							if(ledge[x][y - 3] == 0)
							{
								domY[x][y][i] -= DOM_ASCENDSPEED;

								//rubble!
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] || domino[x][y - 2][i2])
									{
										
										domino[x][y - 0][i] = 0;
										domino[x][y - 1][i2] = 0;
										domino[x][y - 2][i2] = 0;
										makeRubble(x, y - 3, 2);
									}
								}

								//move up a tile
								if(domY[x][y][i] <= -16.0)
								{
									domino[x][y - 1][i] = domino[x][y][i];
									domino[x][y][i] = 0;

									domY[x][y - 1][i] = domY[x][y][i] + 16.0;
									domFrame[x][y - 1][i] = domFrame[x][y][i];
									domFrameChange[x][y - 1][i] = domFrameChange[x][y][i];
									domState[x][y - 1][i] = domState[x][y][i];

									break;
								}
							}
							else
								domY[x][y][i] = 0;

							//can't ascend all the way - block in the way to the right
							if(domFrame[x][y][i] == 11)
							{
								if(x + 1 < MAPWIDTH)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//ascender next to it
										if(domino[x + 1][y][i2] > 0)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//can't ascend all the way 2 - standing block in the way to the right
							if(domFrame[x][y][i] == 10)
							{
								if(x + 1 < MAPWIDTH)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//ascender next to it
										//if(domino[x + 1][y][i2] > 0)
										//{
										//	domFrameChange[x][y][i] = 0.0;
										//}

										//something standing up, one tile down
										if(domino[x + 1][y + 1][i2] > 0 && domFrame[x + 1][y + 1][i2] == DOM_UPRIGHT)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//can't ascend all the way 3 - block two tiles to the right is leaning left
							if(domFrame[x][y][i] == 11)
							{
								if(x + 3 < MAPWIDTH)
								{
									for(i2 = 0; i2 < 2; i2++)
									{
										//block leaning left
										if(domino[x + 2][y][i2] > 0 && domFrame[x + 2][y][i2] <= 1)
										{
											domFrameChange[x][y][i] = 0.0;
										}

									}
								}
							}

							//have fallen flat
							if(domFrame[x][y][i] == 12)
							{
								domFrameChange[x][y][i] = 0.0;
								//move a tile right if there's no ledge there
								//so the ascender can flip up
								if(x + 1 < MAPWIDTH)
								{
									if(ledge[x + 1][y - 3] == 0)
									{
										domino[x + 1][y][i] = domino[x][y][i];
										domino[x][y][i] = 0;

										domFrame[x + 1][y][i] = 0;
										domFrameChange[x + 1][y][i] = 0.0;
										domState[x + 1][y][i] = domState[x][y][i];
										domY[x + 1][y][i] = 0;

										break;
									}
								}

								//OR, there could be no ledge where the ascender actually is
								//in which case, make it flip the other way
								if(ledge[x][y - 3] == 0)
								{
									domState[x][y][i] = STATE_ASCLEFT;
									break;
								}
							}
						}
						else
						{
							domY[x][y][i] -= DOM_ASCENDSPEED;
							if(domY[x][y][i] < -48)
								domino[x][y][i] = 0;
						}

						break;

					case STATE_ASCEND:
						if(y > 2)
						{
							//check whether to rise
							if(ledge[x][y - 3] == 0)
							{
								domY[x][y][i] -= DOM_ASCENDSPEED;

								//rubble!
								for(i2 = 0; i2 < 2; i2++)
								{
									if(domino[x][y - 1][i2] || domino[x][y - 2][i2])
									{
										
										domino[x][y - 0][i] = 0;
										domino[x][y - 1][i2] = 0;
										domino[x][y - 2][i2] = 0;
										makeRubble(x, y - 3, 2);
									}
								}

								if(domY[x][y][i] <= -16)
								{
									//rocket - smoke
									if(domino[x][y][i] == D_ROCKET)
									{
										startEffect(x,y - 2,EFF_DUST);
									}
									
									domino[x][y - 1][i] = domino[x][y][i];
									domino[x][y][i] = 0;

									domY[x][y - 1][i] = domY[x][y][i] + 16;
									domState[x][y - 1][i] = domState[x][y][i];
									domFrame[x][y - 1][i] = domFrame[x][y][i];
									domFrameChange[x][y - 1][i] = 0;
								}
							}
							else
							{
								domY[x][y][i] = 0;

								//rocket - BOOM!
								if(domino[x][y][i] == D_ROCKET)
								{
									playSound(-1, SND_EXPLODER, 0, x * 32);

									//ledge
									ledge[x][y - 3] = 0;
									//ladders
									ladder[x][y - 3] = 0;
									if(x > 0)
										if(ledge[x - 1][y - 3])
											ladder[x - 1][y - 3] = 0;
									if(x + 1 < MAPWIDTH)
										if(ledge[x + 1][y - 3])
											ladder[x + 1][y - 3] = 0;

									updateLedge();
									startEffect(x,y - 2,EFF_EXPLOSION);
									domino[x][y][i] = 0;
									break;
								}

								for(i2 = 0; i2 < 2; i2++)
								{
									//check if getting knocked over
									//by normal
									//from the left
									if(x > 0 && y + 1 < MAPHEIGHT2)
									{
										if(domino[x - 1][y + 1][i2] > 0 && domino[x - 1][y + 1][i2] != D_ASCENDER && domFrame[x - 1][y + 1][i2] > DOM_UPRIGHT + 2)
										{
											domState[x][y][i] = STATE_ASCRIGHT;
										}
									}
									//from the right
									if(x + 1 < MAPWIDTH && y + 1 < MAPHEIGHT2)
									{
										if(domino[x + 1][y + 1][i2] > 0 && domino[x + 1][y + 1][i2] != D_ASCENDER && domFrame[x + 1][y + 1][i2] < DOM_UPRIGHT - 2)
										{
											domState[x][y][i] = STATE_ASCLEFT;
										}
									}

									//other ascenders:
									//from the left
									if(x > 0)
									{
										if(domino[x - 1][y][i2] > 0 && domino[x - 1][y][i2] == D_ASCENDER && domFrame[x - 1][y][i2] >= 9)
										{
											domState[x][y][i] = STATE_ASCRIGHT;
										}
									}
									//from the right
									if(x + 1 < MAPWIDTH)
									{
										if(domino[x + 1][y][i2] > 0 && domino[x + 1][y][i2] == D_ASCENDER && domFrame[x + 1][y][i2] <= 3)
										{
											domState[x][y][i] = STATE_ASCLEFT;
										}
									}
								}
							}
						}
						else
						{
							domY[x][y][i] -= DOM_ASCENDSPEED;
							if(domY[x][y][i] < -48)
								domino[x][y][i] = 0;
						}
						
						break;

					case STATE_PICKUP:
						domX[x][y][i] -= 0.25;
						if(domX[x][y][i] < -2.25)
						{
							domX[x][y][i] = -2.25;
							//domY[x][y][i] -= 1;
						}

						domY[x][y][i] += 0.33;
						if(domY[x][y][i] > 3)
							domY[x][y][i] = 3;

						break;

					case STATE_PUTDOWN:
						domX[x][y][i] += 0.25;
						if(domX[x][y][i] > 0)
						{
							domX[x][y][i] = 0;
							domY[x][y][i] = 0;
							domState[x][y][i] = STATE_STANDING;
						}
						domY[x][y][i] -= 0.33;
						if(domY[x][y][i] < 0)
							domY[x][y][i] = 0;
						break;

					} //end of switch

					if(domState[x][y][i] != STATE_PICKUP && domState[x][y][i] != STATE_PUTDOWN)
						domX[x][y][i] = 0;

				}
			}
		}
	}

	if(completeCheck)
	{
		if(levelCompleteState == 0)
		{
			if(levelComplete())
			{
				completeLevel();
			}
			else
			{
				levelCompleteState = 2;
			}
		}
	}

}

#endif