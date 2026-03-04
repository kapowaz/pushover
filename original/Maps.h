#ifndef __MAPS_H
#define __MAPS_H

int readInt(ifstream &file)
{
	//return (file.get() << 24) + (file.get() << 16) + (file.get() << 8) + file.get();
	//char buf[4];
	//char debug[255] = "";
	//sprintf(debug, "Read int %u %X", number, number);
	//MessageBox(NULL, debug, "WTF", MB_OK);
	//file.read(buf,4);
	//number = buf[0] + (buf[1] << 8) + (buf[2] << 16) + (buf[3] << 24);

	unsigned int number = (file.get()) + (file.get() << 8) + (file.get() << 16) + (file.get() << 24);
	
	//dodgy workaround for ifstream
	if(number >= 27)
		number--;

	return number;
}

void writeInt(ofstream &file, int number)
{
	if(number >= 26)
	{
		number++;
	}

	int a = (number % 256);
	number <<= 8;
	int b = (number % 256);
	number <<= 8;
	int c = (number % 256);
	number <<= 8;
	int d = (number % 256);

	file.put(a);
	file.put(b);
	file.put(c);
	file.put(d);
}

//binary file reading / writing funcs

void breadBool(ifstream &file, bool &number)
{
	file.read((char*) &number, sizeof(number));
}

void breadInt(ifstream &file, int &number)
{
	file.read((char*) &number, sizeof(number));
}

void breadString(ifstream &file, char *text)
{
	int size;
	breadInt(file, size);
	file.read(text, size);
	if(size > 0) text[size] = 0;
}

void bwriteBool(ofstream &file, bool number)
{
	file.write((char*) &number, sizeof(number));
}

void bwriteInt(ofstream &file, int number)
{
	file.write((char*) &number, sizeof(number));
}

void bwriteString(ofstream &file, char *text)
{
	int size = strlen(text);
	bwriteInt(file, size);
	file.write(text, size);
}

void drawMap()
{
	int x, y, i;

	char debug[255] = "";

	//meccano zone fudge!!
	if(gameTileset == 7 || gameTileset == 25)
	{
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				blit(tileset[15],(x - 1) * 32,y * 32, screen);
			}
		}

		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				if(background[x][y])
				{
					blit(tileset[background[x][y] + 12],((x - 1) * 32) + 48,(y * 32) + 48, screen);
				}
			}
		}
	}

	//ice cave backdrop
	if(gameTileset == 14 || gameTileset == 32)
	{
		blit(templeBG->frame(1), BGPos, 0, screen);
		blit(templeBG->frame(1), BGPos - 640, 0, screen);
		blit(templeBG->frame(0), 0, 0, screen);
	}

	//sky temple backdrop
	if(gameTileset == 18 || gameTileset == 36)
	{
		blit(templeBG->frame(0), 0, -160 + (sin(templeBGAngle) * 160), screen);
	}
	
	//background layer
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT; y++)
		{
			//sprintf(debug, "background[%i][%i] is %u\n\nbackground[%i][%i] - 1 is %u", x, y, background[x][y], x, y, background[x][y] - 1);
			//MessageBox(NULL, debug, "WTF", MB_OK);

			if(background[x][y])
			{
				blit(tileset[background[x][y] - 1], (x - 1) * 32, y * 32, screen);
			}
		}
	}

	//ledge shadow layer
	for(y = MAPHEIGHT2 - 1; y >= 0; y--)
	{
		//draw the layer y - 1
		for(x = 0; x < MAPWIDTH; x++)
		{
			if(ledge[x][y])
			{
				blit(tileset[ledge[x][y] + 10], (x - 1) * 32, y * 16, screen);
			}
		}
	}

	//ledge & domino & rubble layers
	for(y = MAPHEIGHT2; y >= 0; y--)
	{
		if(y > 0)
		{
			//draw the layer y - 1
			for(x = 0; x < MAPWIDTH; x++)
			{
				if(ledge[x][y - 1])
				{
					blit(tileset[ledge[x][y - 1] - 1], (x - 1) * 32, (y - 1) * 16, screen);
				}
			}
		}
		
		if(y < MAPHEIGHT2)
		{
			for(x = 0; x < MAPWIDTH; x++)
			{
				//rubble
				if(rubble[x][y])
				{
					blit(rubbleImg[rubble[x][y] - 1], (x - 1) * 32, y * 16 - 24 + static_cast<int>(rubbleY[x][y]), screen);
				}

				//domino
				for(i = 0; i < 2; i++)
				{
					if(domino[x][y][i])
					{
						int domDrawType = domino[x][y][i];
						//if(currentMap == 100)
						//	domDrawType = 1;
						blit(dominoes[((domDrawType - 1) * DOM_FPD) + domFrame[x][y][i]], (x - 1) * 32 - 22 + static_cast<int>(domX[x][y][i]), (y * 16 - 30) + static_cast<int>(domY[x][y][i]), screen);
					}
				}
			}
		}
		
	}

	//two player rendering offset
	if(GIOut == 2)
	{
		//if(ants.first->data->GIX == ants.last->data->GIX && ants.first->data->GIY == ants.last->data->GIY)
		//{
			renderFirst->data->GIXOffset++;
			renderFirst->data->otherGI->data->GIXOffset--;
		//}
		renderFirst->data->GIYOffset--;
	}

	if(levelState == LS_CLOSEDOOR || levelState == LS_PLAYING || levelState == LS_OPENEXIT)
	{
		//for(antEl = ants.first; antEl != NULL; NE(antEl))
		//{
		//	antEl->data->draw(0);
		//}
		renderFirst->data->draw(0);
		renderFirst->data->otherGI->data->draw(0);
	}

	//ladder layer
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(ladder[x][y])
			{
				blit(tileset[ladder[x][y] - 1], (x - 1) * 32, y * 16, screen);
			}
		}
	}

	if(levelState == LS_CLOSEDOOR || levelState == LS_PLAYING || levelState == LS_OPENEXIT)
	{
		//for(antEl = ants.first; antEl != NULL; NE(antEl))
		//{
		//	antEl->data->draw(1);
		//}
		renderFirst->data->draw(1);
		renderFirst->data->otherGI->data->draw(1);
	}

	//cancel out two player rendering offset
	if(GIOut == 2)
	{
		//if(ants.first->data->GIX == ants.last->data->GIX && ants.first->data->GIY == ants.last->data->GIY)
		//{
			renderFirst->data->GIXOffset--;
			renderFirst->data->otherGI->data->GIXOffset++;
		//}
		renderFirst->data->GIYOffset++;
	}
}

void saveTokenState()
{	
	int x, y, i;
	
	tokenSaved = true;

	for(antEl = ants.first; antEl != NULL; NE(antEl))
	{
		antEl->data->tokenGIX = antEl->data->GIX;
		antEl->data->tokenGIY = antEl->data->GIY;
	}

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			tokenLedge[x][y] = ledge[x][y];
			tokenLadder[x][y] = ladder[x][y];

			for(i = 0; i < 2; i++)
			{
				tokenDomino[x][y][i] = domino[x][y][i];
				tokenDomState[x][y][i] = domState[x][y][i];
				tokenDomFrame[x][y][i] = domFrame[x][y][i];
				tokenDomFrameChange[x][y][i] = domFrameChange[x][y][i];

				if(0){
				tokenDomX[x][y][i] = domX[x][y][i];
				}
				
				tokenDomY[x][y][i] = domY[x][y][i];
				tokenDomDelay[x][y][i] = domDelay[x][y][i];
			}
			tokenRubble[x][y] = rubble[x][y];
			tokenRubbleY[x][y] = rubbleY[x][y];
		}
	}

	tokenMins = mins;
	tokenSecs = secs;

}

void restoreTokenState()
{
	int x, y, i;

	tokenSaved = true;

	for(antEl = ants.first; antEl != NULL; NE(antEl))
	{
		antEl->data->GIX = antEl->data->tokenGIX;
		antEl->data->GIY = antEl->data->tokenGIY;

		antEl->data->GIState = GI_STAND;
		antEl->data->GIFrame = GIF_STAND;
	}
	
	levelState = LS_PLAYING;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			ledge[x][y] = tokenLedge[x][y];
			ladder[x][y] = tokenLadder[x][y];

			for(i = 0; i < 2; i++)
			{
				domino[x][y][i] = tokenDomino[x][y][i];
				domState[x][y][i] = tokenDomState[x][y][i];
				domFrame[x][y][i] = tokenDomFrame[x][y][i];
				domFrameChange[x][y][i] = tokenDomFrameChange[x][y][i];
				domX[x][y][i] = tokenDomX[x][y][i];
				domY[x][y][i] = tokenDomY[x][y][i];
				domDelay[x][y][i] = tokenDomDelay[x][y][i];
			}

			rubble[x][y] = tokenRubble[x][y];
			rubbleY[x][y] = tokenRubbleY[x][y];
		}
	}

	initTimer(tokenMins, tokenSecs);
}

void loadMap(int map, bool skipDomino, bool restoreToken, bool playVid)
{
	endVideoRecord();
	endVideoPlay();
	
	if(playVid)
		beginVideoPlay();

	currentMap = map;

	char filename[255] = "";
	sprintf(filename,"Data\\Map\\%i\\%i.map", mapSet, map);

	ifstream mapFile;
	int x, y, i;
	int m, s;

	mapFile.open(filename);
	if(!mapFile.fail())
	{
		//load map!

		//file format version
		int version = readInt(mapFile);

		//load tileset
		loadTileset(readInt(mapFile));

		//load dominoset
		int dominoSet;
		if(version >= 8)
			dominoSet = readInt(mapFile);
		else
			dominoSet = 1;
		if(!skipDomino) loadDominoImages(dominoSet);

		//start position
		if(version >= 3)
		{
			doorX = readInt(mapFile);
			doorY = readInt(mapFile);
		}
		else
		{
			doorX = 0;
			doorY = 0;
		}

		//start position 2
		if(version >= 9)
		{
			door2X = readInt(mapFile);
			door2Y = (readInt(mapFile) - 1) / 2;
		}
		else
		{
			door2X = -1;
			door2Y = -1;
		}

		//time
		if(version >= 5)
		{
			m = readInt(mapFile);
			s = readInt(mapFile);
		}
		else
		{
			m = 1;
			s = 0;
		}

		//default exit positions in case there isn't one in the level
		//exitX = 1;
		//exitY = 0;

		//background layer
		for(x = 0; x < MAPWIDTH - 2; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				background[x + 1][y] = readInt(mapFile);

				//check if this is the exit door - all non-entrance doors are now exits
				//if(background[x][y] == 7 && (x != doorX + 1 || y != doorY))
				//{
				//	exitX = x;
				//	exitY = y;
				//}
			}
		}

		if(version >= 2)
		{
			//ledge layer
			for(x = 0; x < MAPWIDTH - 2; x++)
			{
				for(y = 0; y < MAPHEIGHT2; y++)
				{
					ledge[x + 1][y] = readInt(mapFile);
				}
			}

			//domino layer
			for(x = 0; x < MAPWIDTH - 2; x++)
			{
				for(y = 0; y < MAPHEIGHT2; y++)
				{
					domino[x + 1][y][0] = readInt(mapFile);
					domino[x + 1][y][1] = 0;
				}
			}

			//ladder layer
			if(version >= 4)
			{
				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = 0; y < MAPHEIGHT2; y++)
					{
						ladder[x + 1][y] = readInt(mapFile);
					}
				}
			}
			else
			{
				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = 0; y < MAPHEIGHT; y++)
					{
						ladder[x + 1][y] = readInt(mapFile);
					}
				}

				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = MAPHEIGHT; y < MAPHEIGHT2; y++)
					{
						ladder[x + 1][y] = 0;
					}
				}
			}
		}

		if(version == 6)
		{
			//read author
			i = 0;
			do {
				mapFile >> author[i];
				if(author[i] == '_')
					author[i] = ' ';
			} while(author[i++] != '-');
			author[i - 1] = 0;

			//read clue
			i = 0;
			do {
				mapFile >> clue[i];
				if(clue[i] == '_')
					clue[i] = ' ';
			} while(clue[i++] != '-');
			clue[i - 1] = 0;
		}
		else if(version >= 7)
		{
			//read author
			i = 0;
			do {
				mapFile >> author[i];
				if(author[i] == '_')
					author[i] = ' ';
			} while(author[i++] != '@');
			author[i - 1] = 0;

			//read clue
			i = 0;
			do {
				mapFile >> clue[i];
				if(clue[i] == '_')
					clue[i] = ' ';
			} while(clue[i++] != '@');
			clue[i - 1] = 0;
		}
		else
		{
			sprintf(author,"");
			sprintf(clue,"");
		}

		mapFile.close();
	
	}
	else
	{
		//make a map up ^_^

		//load tileset
		loadTileset(1);

		doorX = 0;
		doorY = 0;
		door2X = -1;
		door2Y = -1;

		//exitX = 1;
		//exitY = 0;

		m = 1;
		s = 0;

		//background layer
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				background[x][y] = 0;
			}
		}

		//ledge layer
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT2; y++)
			{
				ledge[x][y] = 0;
			}
		}

		//domino layer
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT2; y++)
			{
				domino[x][y][0] = 0;
				domino[x][y][1] = 0;
			}
		}

		//ladder layer
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT2; y++)
			{
				ladder[x][y] = 0;
			}
		}

		sprintf(author,"");
		sprintf(clue,"");

		//end of making up map ^_^
	}

	//set up level to play
	initialiseDominoes();

	//clear out rubble
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			rubble[x][y] = 0;
		}
	}

	//door modifier after adding some extra grid width!
	doorX++;
	if(door2X != -1)
		door2X++;
	//exitX;

	//GI
	for(antEl = ants.first; antEl != NULL; NE(antEl))
	{
		antEl->data->GIState = GI_EXIT;
		antEl->data->GIFrame = GIF_EXIT_S;
		if(antEl->data->playerNum == 0)
		{
			antEl->data->GIX = doorX;
			antEl->data->GIY = (doorY * 2) + 2;

			antEl->data->enabled = true;
		}
		else
		{
			antEl->data->GIX = door2X;
			antEl->data->GIY = (door2Y * 2) + 2;

			if((antEl->data->GIX <= 0 && antEl->data->GIY <= 0) || (antEl->data->GIX >= 23 && antEl->data->GIY >= 32))
			{
				antEl->data->enabled = false;
				GIOut = 1;

				//sets control scheme
				ants.first->data->setControls(0);
				ants.last->data->setControls(3);

				door2X = -1;
				door2Y = -1;
			}
			else
			{
				antEl->data->enabled = true;
				GIOut = 2;

				//sets control scheme
				ants.first->data->setControls(1);
				ants.last->data->setControls(2);
			}
		}
		antEl->data->GIXOffset = 0;
		antEl->data->GIYOffset = 0;
		antEl->data->GIPushesRemain = 1;
		antEl->data->GIFallTiles = 0;
		antEl->data->GIDomino = 0;
		antEl->data->GIWaved = false;
		antEl->data->GIShrugNeeded = false;
		antEl->data->GILastMoved = 1;
	}

	levelState = LS_OPENDOOR;
	doorFrameChange = 0;
	levelCompleteState = 0;

	messageDelay = 0;
	messageDelayStyle = 0;

	templeBGAngle = 0;

	//starter domino check
	starter = dominoPresent(D_STARTER);

	//load and play music if it's a new zone
	requestMusic(gameTileset);

	if(!restoreToken)
	{
		initTimer(m,s);
		//door open sound
		playSound(-1, SND_OPEN_DOOR, 0, doorX * 32);
		tokenSaved = 0;

		beginVideoRecord();
	}
	else
	{
		restoreTokenState();
	}

	screenFade = 255;
}

void updateLedge()
{
	int x,y,l,r;

	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(ledge[x][y] > 0)
			{
				l = 0;
				r = 0;

				if(x > 0)
					l = ledge[x - 1][y];
				if(x + 1 < MAPWIDTH)
					r = ledge[x + 1][y];

				if(l == 0 && r == 0)
					ledge[x][y] = 4;
				else if(l > 0 && r == 0)
					ledge[x][y] = 3;
				else if(l > 0 && r > 0)
					ledge[x][y] = 2;
				else
					ledge[x][y] = 1;
			}
		}
	}
}

bool loadMiniMap(int map, bool renderMiniMap)
{
	char filename[255] = "";
	sprintf(filename,"Data\\Map\\%i\\%i.map", mapSet, map);

	ifstream mapFile;
	int x, y, i, tileset;
	int tempDominoSet;

	mapFile.open(filename);
	if(!mapFile.fail())
	{
		//load map!

		//file format version
		int version = readInt(mapFile);

		//load tileset
		tileset = readInt(mapFile);
		loadBabyTileset(tileset, map);

		//load dominoset
		if(version >= 8)
			tempDominoSet = readInt(mapFile);
		else
			tempDominoSet = 1;

		//start position
		/*
		if(version >= 3)
		{
			doorX = readInt(mapFile);
			doorY = readInt(mapFile);
		}
		else
		{
			doorX = 0;
			doorY = 0;
		}

		//time
		if(version >= 5)
		{
			m = readInt(mapFile);
			s = readInt(mapFile);
		}
		else
		{
			m = 1;
			s = 0;
		}

		//default exit positions in case there isn't one in the level
		exitX = 1;
		exitY = 0;
		*/
		if(version >= 3)
		{
			readInt(mapFile);
			readInt(mapFile);
		}
		if(version >= 5)
		{
			readInt(mapFile);
			readInt(mapFile);
		}

		//background layer
		for(x = 0; x < MAPWIDTH - 2; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				background[x + 1][y] = readInt(mapFile);
			}
		}

		if(version >= 2)
		{
			//ledge layer
			for(x = 0; x < MAPWIDTH - 2; x++)
			{
				for(y = 0; y < MAPHEIGHT2; y++)
				{
					ledge[x + 1][y] = readInt(mapFile);
				}
			}

			//domino layer
			for(x = 0; x < MAPWIDTH - 2; x++)
			{
				for(y = 0; y < MAPHEIGHT2; y++)
				{
					domino[x + 1][y][0] = readInt(mapFile);
					domino[x + 1][y][1] = 0;
				}
			}

			//ladder layer
			if(version >= 4)
			{
				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = 0; y < MAPHEIGHT2; y++)
					{
						ladder[x + 1][y] = readInt(mapFile);
					}
				}
			}
			else
			{
				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = 0; y < MAPHEIGHT; y++)
					{
						ladder[x + 1][y] = readInt(mapFile);
					}
				}

				for(x = 0; x < MAPWIDTH - 2; x++)
				{
					for(y = MAPHEIGHT; y < MAPHEIGHT2; y++)
					{
						ladder[x + 1][y] = 0;
					}
				}
			}
		}

		if(version == 6)
		{
			//read author
			i = 0;
			do {
				mapFile >> author[i];
				if(author[i] == '_')
					author[i] = ' ';
			} while(author[i++] != '-');
			author[i - 1] = 0;
		}
		else if(version >= 7)
		{
			//read author
			i = 0;
			do {
				mapFile >> author[i];
				if(author[i] == '_')
					author[i] = ' ';
			} while(author[i++] != '@');
			author[i - 1] = 0;
		}
		else
		{
			sprintf(author,"");
			sprintf(clue,"");
		}

		mapFile.close();
	
	}
	else
	{
		return 0;
	}

	//render minimap
	if(renderMiniMap)
	{
		SDL_FreeSurface(miniMap);
		miniMap = SDL_CreateRGBSurface(0, 160, 120, 32, 0, 0, 0, 0);
		SDL_SetColorKey(miniMap, SDL_SRCCOLORKEY, 0xFF00FF);

		//draw the map

		//meccano zone fudge!!
		if(tileset == 7 || gameTileset == 25)
		{
			//blue background
			for(x = 0; x < MAPWIDTH; x++)
			{
				for(y = 0; y < MAPHEIGHT; y++)
				{
					blit(babyTileset->frame(15), x * 8, y * 8, miniMap);
				}
			}
		}

		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = 0; y < MAPHEIGHT; y++)
			{
				//background
				if(background[x + 1][y])
					blit(babyTileset->frame(background[x + 1][y] - 1), x * 8, y * 8, miniMap);
			}
		}
		for(x = 0; x < MAPWIDTH; x++)
		{
			for(y = MAPHEIGHT2 - 1; y >= 0; y--)
			{
				//ledge
				if(ledge[x + 1][y])
				{
					blit(babyTileset->frame(ledge[x + 1][y] + 10), x * 8, y * 4, miniMap);
					blit(babyTileset->frame(ledge[x + 1][y] - 1), x * 8, y * 4, miniMap);
				}

				//domino
				if(domino[x + 1][y][0])
				{
					blit(babyDomino.frame(domino[x + 1][y][0] - 1,tempDominoSet - 1),x * 8 + 3, y * 4 - 8, miniMap);
				}
			}
		}
		for(x = 0; x < MAPWIDTH; x++)
		{ 
			for(y = 0; y < MAPHEIGHT2; y++)
			{
				//ladders
				if(ladder[x + 1][y])
					blit(babyTileset->frame(ladder[x + 1][y] - 1), x * 8, y * 4, miniMap);
			}
		}
	}

	return 1;
}

int readTileset(int map)
{
	char filename[255] = "";
	sprintf(filename,"Data\\Map\\%i\\%i.map", mapSet, map);

	ifstream mapFile;
	int tset;

	mapFile.open(filename);
	if(!mapFile.fail())
	{
		//load map!

		//file format version
		readInt(mapFile);

		//load tileset
		tset = readInt(mapFile);

		mapFile.close();

		return tset;
	}

	return 0;
}

#endif