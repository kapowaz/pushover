#ifndef __TITLE_H
#define __TITLE_H

Font dominoFont;

AnimImage conveyor;
AnimImage arrows;

int arrow1X, arrow2X;

SDL_Surface *titleBackdrop;
SDL_Surface *titleFront;
SDL_Surface *titleFront2;
SDL_Surface *panelFrame;

#define PANELS 37
AnimImage panels;

char titleMessages[20][256];
int titleMessageX;
int titleMessageNum;

int conveyorFrame;

int titleCam;

//temp profile stuff
char titleName[9];
int titleNameCursor;

//options
char titleOptions[5][256];
int titleSelect;
int titleMenu;
int titleMax;
int titleMin;
int titleScroll;

int levelSelect;
int levelScroll;
int levelScrollControl(0);

void renderTitle();
void processTitle();
void switchMenu(int menu, bool changeSelect = 1);
void selectOption();
char getInput();
void refreshLevelSelect();

#define MENU_MAIN 0
#define MENU_OPTIONS 1
#define MENU_NEWGAME 2
#define MENU_LOADGAME 3
#define MENU_ERASEGAME 4
#define MENU_ERASECHECK 5
#define MENU_LEVELSELECT 6
#define MENU_LEVELOPTIONS 7

void loadTitle()
{
	dominoFont.load("Resource\\Image\\Title\\Domino Font.ishi","ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-+",32,35,1,true);

	sprintf(titleMessages[0] ,"PUSHOVER 2 by +ishisoft");
	sprintf(titleMessages[1] ,"original game copyright 1992 RED RAT and OCEAN");
	sprintf(titleMessages[2] ,"CODING AND GRAPHICS - craig forrester");
	sprintf(titleMessages[3] ,"ADDITIONAL GRAPHICS - jim riley");
	sprintf(titleMessages[4] ,"ADDITIONAL CODING - rob emery");
	sprintf(titleMessages[5] ,"ORIGINAL CONCEPT - chas partington");
	sprintf(titleMessages[6] ,"ORIGINAL PUZZLES - harry nadler, helen elcock, avril rigby, don rigby, chris waterworth");
	sprintf(titleMessages[7] ,"MUSIC & SFX - jonathan dunn, dean evans, keith tinman");
	sprintf(titleMessages[8] ,"THANKS TO - the people at www.retroremakes.com");
	sprintf(titleMessages[9] ,"");
	sprintf(titleMessages[10],"");
	sprintf(titleMessages[11],"");
	sprintf(titleMessages[12],"");
	sprintf(titleMessages[13],"");
	sprintf(titleMessages[14],"");
	sprintf(titleMessages[15],"");
	sprintf(titleMessages[16],"");
	sprintf(titleMessages[17],"");
	sprintf(titleMessages[18],"");
	sprintf(titleMessages[19],"new puzzles - +ishi, endurion");
	titleMessageX = 640;
	titleMessageNum = 0;

	conveyor.load("Resource\\Image\\Title\\Conveyor.ishi",32,32,1,4);
	conveyorFrame = 0;

	arrows.load("Resource\\Image\\Title\\Arrows.ishi",32,64,2,2);
	arrow1X = 0;
	arrow2X = 0;

	titleCam = 0;

	//titleBackdrop = IMG_Load("Resource\\Image\\Title\\Backdrop.ishi");
	titleFront = IMG_Load("Resource\\Image\\Title\\Front.ishi");
	SDL_SetColorKey(titleFront, SDL_SRCCOLORKEY, 0xFF00FF);
	titleFront2 = IMG_Load("Resource\\Image\\Title\\Front2.ishi");
	SDL_SetColorKey(titleFront2, SDL_SRCCOLORKEY, 0xFF00FF);
	panelFrame = IMG_Load("Resource\\Image\\Title\\Panel Frame.ishi");
	SDL_SetColorKey(panelFrame, SDL_SRCCOLORKEY, 0xFF00FF);

	panels.load("Resource\\Image\\Title\\Panels.ishi",256,32,1,PANELS);

	//blackScreen = SDL_CreateRGBSurface(0, 640, 480, 32, 0, 0, 0, 0);

	switchMenu(MENU_MAIN);

	//load all the mini maps - just gets the tileset numbers for the list
	for(int i = 1; i <= LASTMAP; i++)
	{
		loadMiniMap(i,0);
	}
}

void switchMenu(int menu, bool changeSelect)
{
	titleMenu = menu;
	titleMin = 0;
	if(changeSelect)
		titleSelect = 0;
	switch(menu)
	{
	case MENU_MAIN:
		sprintf(titleOptions[0],"NEW GAME");
		sprintf(titleOptions[1],"LOAD GAME");
		sprintf(titleOptions[2],"ERASE GAME");
		sprintf(titleOptions[3],"OPTIONS");
		sprintf(titleOptions[4],"QUIT");
		titleMax = 4;
		break;
	case MENU_OPTIONS:
		if(music)
			sprintf(titleOptions[0],"MUSIC: ON ");
		else
			sprintf(titleOptions[0],"MUSIC: OFF");

		if(sound)
			sprintf(titleOptions[1],"SOUND: ON ");
		else
			sprintf(titleOptions[1],"SOUND: OFF");

		if(windowed)
			sprintf(titleOptions[2],"FULLSCREEN: OFF");
		else
			sprintf(titleOptions[2],"FULLSCREEN: ON ");

		sprintf(titleOptions[3],"BACK");
		sprintf(titleOptions[4],"");
		titleMax = 3;
		break;
	case MENU_NEWGAME:
		sprintf(titleOptions[0]," ");
		sprintf(titleOptions[1],"ENTER NAME:");
		sprintf(titleOptions[2]," ");
		sprintf(titleOptions[3]," ");
		sprintf(titleOptions[4]," ");
		titleMax = 0;
		break;
	case MENU_LOADGAME:
		profiles.addback(new Profile("BACK"));

		sprintf(titleOptions[0],"");
		sprintf(titleOptions[1],"");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"");
		sprintf(titleOptions[4],"");

		titleScroll = 0;

		titleMax = -1;
		//count profiles
		for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
		{
			titleMax++;
		}
		break;
	case MENU_ERASEGAME:
		profiles.addback(new Profile("BACK"));

		sprintf(titleOptions[0],"");
		sprintf(titleOptions[1],"");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"");
		sprintf(titleOptions[4],"");

		titleScroll = 0;

		titleMax = -1;
		//count profiles
		for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
		{
			titleMax++;
		}
		break;
	case MENU_ERASECHECK:
		sprintf(titleOptions[0],"ARE YOU SURE");
		sprintf(titleOptions[1],"YOU WANT TO ERASE?");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"ERASE");
		sprintf(titleOptions[4],"CANCEL");
		titleMin = 3;
		titleMax = 4;
		titleSelect = 3;
		break;
	case MENU_LEVELSELECT:
		sprintf(titleOptions[0],"");
		sprintf(titleOptions[1],"");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"");
		sprintf(titleOptions[4],"");
		titleMax = 0;

		if(changeSelect)
		{
			levelSelect = activeProfile->data->levelsComplete[mapSet];
			if(levelSelect < 1)
				levelSelect = 1;
			if(levelSelect > LASTMAP)
				levelSelect = LASTMAP;

			if(mapSet == MS_CUSTOM)
			{
				levelSelect = 1;
			}

			//scroll
			levelScroll = levelSelect - 1;
			if(levelScroll < 1)
				levelScroll = 1;

			if(levelScroll > LASTMAP - 5)
			levelScroll = LASTMAP - 5;
		}

		loadMiniMap(levelSelect, 1);

		break;

	case MENU_LEVELOPTIONS:
		sprintf(titleOptions[0],"");
		sprintf(titleOptions[1],"");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"");
		sprintf(titleOptions[4],"");
		titleMax = 2;

		break;
	default:
		sprintf(titleOptions[0],"..default..");
		sprintf(titleOptions[1],"");
		sprintf(titleOptions[2],"");
		sprintf(titleOptions[3],"");
		sprintf(titleOptions[4],"");
		titleMax = 0;
		break;
	}
}

void selectOption()
{
	int i;
	switch(titleMenu)
	{
	case MENU_MAIN:
		switch(titleSelect)
		{
		case 0: //new game
			sprintf(titleName,"");
			titleNameCursor = 0;
			switchMenu(MENU_NEWGAME);
			break;
		case 1: //load game
			switchMenu(MENU_LOADGAME);
			break;
		case 2: //erase game
			switchMenu(MENU_ERASEGAME);
			break;
		case 3: //options
			switchMenu(MENU_OPTIONS);
			break;
		case 4: //quit
			fadeOut();
			exit(0);
			break;

		default:
			break;
		}
		
		break;

	case MENU_OPTIONS:
		switch(titleSelect)
		{
		case 0: //music
			music = 1 - music;
			if(!music)
				Mix_HaltMusic();
			else
			{
				currentZone = 0;
				requestMusic(100);
			}

			switchMenu(MENU_OPTIONS,0);
			saveConfig();
			break;
		case 1:
			sound = 1 - sound;
			switchMenu(MENU_OPTIONS,0);
			saveConfig();
			break;
		case 2:
			windowed = 1 - windowed;
			//setHelp(HELP_SCREENMODECHANGE,0);
			if(!windowed)
			{
				screen = SDL_SetVideoMode(640, 480, 32, SDL_FULLSCREEN);
			}
			else
			{
				screen = SDL_SetVideoMode(640, 480, 32, SDL_SWSURFACE);
				SDL_ShowCursor(SDL_DISABLE);
			}

			switchMenu(MENU_OPTIONS,0);
			saveConfig();
			break;
		case 3: //back
			switchMenu(MENU_MAIN);
			break;
		default:
			break;
		}

		break;

	case MENU_LOADGAME:
		i = 0;
		//MessageBox(NULL, "a", "a", MB_OK);
		for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
		{
			if(i == titleSelect)
			{
				activeProfile = profilesIt;
				ants.first->data->currentCostume = activeProfile->data->costume;
			}
			i++;
		}

		//last profile = BACK, so go back
		if(activeProfile == profiles.last)
		{
			switchMenu(MENU_MAIN);
		}
		else
		{
			mapSet = 0;
			switchMenu(MENU_LEVELSELECT);
		}

		//delete BACK profile
		profiles.del(profiles.last);

		break;

	case MENU_ERASEGAME:
		i = 0;
		//MessageBox(NULL, "a", "a", MB_OK);
		for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
		{
			if(i == titleSelect)
				activeProfile = profilesIt;
			i++;
		}

		//last profile = BACK, so go back
		if(activeProfile == profiles.last)
		{
			switchMenu(MENU_MAIN);
		}
		else
		{
			switchMenu(MENU_ERASECHECK);
		}

		//delete BACK profile
		profiles.del(profiles.last);

		break;

	case MENU_ERASECHECK:
		switch(titleSelect)
		{
		case 3:
			profiles.del(activeProfile);
			saveProfiles();
			switchMenu(MENU_MAIN);
			break;
		case 4:
			switchMenu(MENU_MAIN);
			break;
		default:
			break;
		}

		break;

	case MENU_LEVELOPTIONS:
		switch(titleSelect)
		{
		case 0:
			switchMenu(MENU_MAIN);
			break;
		case 1:
			fadeOut();
			exit(0);
			break;
		case 2:
			fadeOut();
			processAwards();
			break;
		default:
			break;
		}

		break;

	default:
		switch(titleSelect)
		{
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			break;
		case 4:
			break;
		default:
			break;
		}

		break;
	}
}

void title()
{
	ants.first->data->setControls(0);
	ants.last->data->setControls(3);

	endVideoRecord();
	endVideoPlay();

	//nice help message!
	if(helpMessageNum < 10)
	{
		setHelp(HELP_GENERAL1 + helpMessageNum, 50);
		helpMessageNum++;
		saveConfig();
	}

	//start music..
	requestMusic(100);

	//load selected minimap
	if(titleMenu == MENU_LEVELSELECT)
		loadMiniMap(levelSelect, 1);

	//load new backdrop based on time of day..
	SDL_FreeSurface(titleBackdrop);
	{
		int h = hours();
		if(h < 6 || h >= 20)
		{
			//night!
			titleBackdrop = IMG_Load("Resource\\Image\\Title\\Backdrop2.ishi");
		}
		else
		{
			//day!
			titleBackdrop = IMG_Load("Resource\\Image\\Title\\Backdrop.ishi");
		}
	}

	//set cam
	if(titleMenu == MENU_LEVELSELECT || titleMenu == MENU_LEVELOPTIONS)
	{
		if(levelSelect == LASTMAP + 1) levelSelect = LASTMAP;
		titleCam = 288;
	}
	else
		titleCam = 0;

	while(DoEvents())
	{
		//HandleEvents();
		//DoEvents();
		processTitle();
		processHelp();
		renderTitle();
		Timer();

		//end game
		if(KeyHit(SDLK_ESCAPE))
		{
			fadeOut();
			exit(0);
		}
	}

	fadeOut();
	exit(0);
}

void processTitle()
{
	//conveyor belt 0-3
	static bool convey = false;
	convey = true - convey;
	if(convey)
	{
		++conveyorFrame %= 4;
	}

	//title messages
	titleMessageX -= 2;
	
	if(titleMessageX < 40 + (static_cast<int>(strlen(titleMessages[titleMessageNum])) * -32))
	{
		titleMessageX = 600;
		titleMessageNum++;
		if(titleMessageNum == 9)
			titleMessageNum = 0;
	}

	screenFade -= 48;
	if(screenFade < 0)
		screenFade = 0;

	//move cam
	if(titleMenu == MENU_LEVELSELECT || titleMenu == MENU_LEVELOPTIONS)
		titleCam += 8;
	else
		titleCam -= 8;

	if(titleCam > 288)
	{
		titleCam = 288;
	}
	if(titleCam < 0)
	{
		titleCam = 0;
	}

	//reset arrows
	if(arrow1X)
		arrow1X--;

	if(arrow2X)
		arrow2X--;

	if(titleMenu == MENU_LEVELOPTIONS)
	{
		//move sideways..
		if(ants.first->data->contHit(CONTRIGHT))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			switchMenu(MENU_LEVELSELECT, 0);

			arrow2X = 7;
		}
	}

	//move up / down
	if(titleMenu != MENU_LEVELSELECT)
	{
		if(ants.first->data->contHit(CONTDOWN))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			titleSelect++;
			if(titleSelect > titleMax)
				titleSelect = titleMin;
		}

		if(ants.first->data->contHit(CONTUP))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			titleSelect--;
			if(titleSelect < titleMin)
				titleSelect = titleMax;
		}
	}
	else
	{
		if(ants.first->data->contDown(CONTDOWN))
		{
			if(levelScrollControl < 0)
				levelScrollControl = 0;
			levelScrollControl++;
		}
		else if(ants.first->data->contDown(CONTUP))
		{
			if(levelScrollControl > 0)
				levelScrollControl = 0;
			levelScrollControl--;
		}
		else
		{
			levelScrollControl = 0;
		}

		//do the moving
		if(levelScrollControl == -1 || levelScrollControl < -10)
		{
			if(levelScrollControl == -1) playSound(-1, SND_BEEP1, 0, 320);
			levelSelect--;
			if(levelSelect < 1)
				levelSelect = LASTMAP;

			loadMiniMap(levelSelect, 1);
		}

		if(levelScrollControl == 1 || levelScrollControl > 10)
		{
			if(levelScrollControl == 1) playSound(-1, SND_BEEP1, 0, 320);
			levelSelect++;
			if(levelSelect > LASTMAP)
				levelSelect = 1;

			loadMiniMap(levelSelect, 1);
		}

		//quick skip
		for(int i = 1; i < 10; i++)
		{
			if(KeyHit(SDLK_0 + i))
			{
				levelSelect = i * 10;
				loadMiniMap(levelSelect, 1);
				playSound(-1, SND_BEEP1, 0, 320);
			}
		}
		if(KeyHit(SDLK_0))
		{
			levelSelect = 100;
			loadMiniMap(levelSelect, 1);
			playSound(-1, SND_BEEP1, 0, 320);
		}

		//scroll to keep up
		if(levelSelect - 1 < levelScroll)
		{
			levelScroll = levelSelect - 1;
			if(levelScroll < 1)
				levelScroll = 1;
		}

		if(levelSelect - 4 > levelScroll)
		{
			levelScroll = levelSelect - 4;
			if(levelScroll > LASTMAP - 5)
				levelScroll = LASTMAP - 5;
		}

		//start level!
		if(ants.first->data->contHit(CONTFIRE))
		{
			if(levelSelect <= activeProfile->data->levelsComplete[mapSet])
			{
				if(levelTileset[levelSelect - 1] > 0)
				{
					playSound(-1, SND_BEEP2, 0, 320);
					fadeOut();
					blankPause();
					loadMap(levelSelect);
					game();
				}
			}
		}

		//move sideways..
		if(ants.first->data->contHit(CONTLEFT))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			arrow1X = 7;

			if(mapSet == 0)
			{
				switchMenu(MENU_LEVELOPTIONS);
			}
			else
			{
				mapSet--;
				refreshLevelSelect();
			}
		}

		if(ants.first->data->contHit(CONTRIGHT) && mapSet < MS_CUSTOM)
		{
			playSound(-1, SND_BEEP1, 0, 320);
			arrow2X = 7;

			mapSet++;
			refreshLevelSelect();
		}
	}

	//scroll
	if((titleMenu == MENU_LOADGAME || titleMenu == MENU_ERASEGAME) && titleMax > 4)
	{
		if(titleSelect - titleScroll < 1)
		{
			titleScroll--;
			if(titleScroll < 0)
				titleScroll = 0;
		}

		if (titleSelect - titleScroll > 3)
			titleScroll++;
	}

	//select option
	if(titleMenu != MENU_NEWGAME && titleMenu != MENU_LEVELSELECT)
	{
		if(ants.first->data->contHit(CONTFIRE))
		{
			playSound(-1, SND_BEEP2, 0, 320);
			selectOption();
		}
	}

	//enter name
	if(titleMenu == MENU_NEWGAME)
	{
		char input = getInput();

		if(input > 0)
		{
			if(input == 1) //backspace
			{
				if(titleNameCursor > 0)
				{
					playSound(-1, SND_BEEP1, 0, 320);
					titleName[--titleNameCursor] = 0;
				}
			}
			else if(input == 2) //return
			{
				playSound(-1, SND_BEEP2, 0, 320);
				profiles.addback(new Profile(titleName));
				activeProfile = profiles.last;
				saveProfiles();

				mapSet = 0;
				switchMenu(MENU_LEVELSELECT);
			}
			else if(input == 3) //escape
			{
				playSound(-1, SND_BEEP2, 0, 320);
				switchMenu(MENU_MAIN);
			}
			else
			{
				if(titleNameCursor < 8)
				{
					playSound(-1, SND_BEEP1, 0, 320);
					titleName[titleNameCursor] = input;
					titleNameCursor++;
					titleName[titleNameCursor] = 0;
				}
			}
		}
	}

	//MikMod_Update();
}

void renderTitle()
{
	//CLEARSCREEN;

	int i;

	//backdrop
	blit(titleBackdrop,0,titleCam * -0.5,screen);
	blit(titleFront2,0,-titleCam,screen);

	//conveyor belt
	//middle
	for(i = 0; i < 16; i++)
	{
		blit(conveyor.frame(0,conveyorFrame),(i + 2) * 32,153 - titleCam,screen);
	}
	//ends
	//blit(conveyor.frame(0,conveyorFrame),64,155,screen);
	//blit(conveyor.frame(2,conveyorFrame),544,155,screen);

	//domino messages
	dominoFont.blitText(titleMessageX, 128 - titleCam, titleMessages[titleMessageNum],screen);

	//foreground
	blit(titleFront,0,-titleCam,screen);

	//options
	for(i = 0; i < 5; i++)
	{
		drawText(333,320 + (i * 24) - titleCam, titleOptions[i], i == titleSelect, 1);
	}

	//name entry
	if(titleMenu == MENU_NEWGAME)
	{
		drawText(333,368 - titleCam, titleName, 1, 1);
	}

	//profiles
	if(titleMenu == MENU_LOADGAME || titleMenu == MENU_ERASEGAME)
	{
		i = -titleScroll;

		for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
		{
			if(i >= 0 && i <= 4)
			{
				drawText(333, 320 + (i * 24) - titleCam, profilesIt->data->name, i + titleScroll == titleSelect, 1);
			}
			i++;
		}
	}

	//level select panels
	if(titleMenu == MENU_LEVELSELECT)
	{
		for(i = 0; i < 6; i++)
		{
			blit(panelFrame, 50, 524 + (i * 37) - titleCam, screen);
			blit(panels.frame(levelTileset[i + levelScroll - 1]),112, 526 + (i * 37) - titleCam, screen);
			drawText(133, 536 + (i * 37) - titleCam, tilesetName[levelTileset[i + levelScroll - 1]], 0, 0);
			drawText(132, 535 + (i * 37) - titleCam, tilesetName[levelTileset[i + levelScroll - 1]], 1, 0);

			//grey panel for locked level
			if(activeProfile)
			{
				if(i + levelScroll > activeProfile->data->levelsComplete[mapSet])
				{
					blit(panels.frame(0),112, 526 + (i * 37) - titleCam, screen);
				}
			}

			char t[10] = "";
			sprintf(t,"%i",i + levelScroll);
			drawText(78, 535 + (i * 37) - titleCam, t, levelSelect == i + levelScroll, 1);
		}

		//mini map!
		//if(titleMenu == MENU_LEVELSELECT)
		//{
			if(levelTileset[levelSelect - 1] && levelSelect <= activeProfile->data->levelsComplete[mapSet])
			{
				blit(miniMap, 252, 316 - titleCam, screen);
			}
		//}

		//title
		drawText(333, 485 - titleCam, "LEVEL SELECT", 1, 1);
		drawText(332, 484 - titleCam, "LEVEL SELECT", 0, 1);

		switch(mapSet)
		{
		case MS_ORIGINAL:
			drawText(333, 505 - titleCam, "ORIGINAL PUZZLES", 1, 1);
			drawText(332, 504 - titleCam, "ORIGINAL PUZZLES", 0, 1);
			break;
		case MS_NEW:
			drawText(333, 505 - titleCam, "NEW PUZZLES", 1, 1);
			drawText(332, 504 - titleCam, "NEW PUZZLES", 0, 1);
			break;
		case MS_MASTER:
			drawText(333, 505 - titleCam, "MASTER PUZZLES", 1, 1);
			drawText(332, 504 - titleCam, "MASTER PUZZLES", 0, 1);
			break;
		case MS_COOP:
			drawText(333, 505 - titleCam, "CO-OPERATIVE PUZZLES", 1, 1);
			drawText(332, 504 - titleCam, "CO-OPERATIVE PUZZLES", 0, 1);
			break;
		case MS_CUSTOM:
			drawText(333, 505 - titleCam, "CUSTOM PUZZLES", 1, 1);
			drawText(332, 504 - titleCam, "CUSTOM PUZZLES", 0, 1);
			break;
		}

		//arrows
		blit(arrows.frame(0,0), 8 - arrow1X, 600 - titleCam, screen);
		blit(arrows.frame(1,mapSet == MS_CUSTOM), 600 + arrow2X, 600 - titleCam, screen);
	}

	//level options
	if(titleMenu == MENU_LEVELOPTIONS)
	{
		int offset = 0;
		for(i = 0; i < titleMax + 1; i++)
		{
			if(i > 1)
				offset = 32;
			else
				offset = 0;

			blit(panelFrame, 50, 524 + (i * 37) - titleCam + offset, screen);
			blit(panels.frame(0),112, 526 + (i * 37) - titleCam + offset, screen);

			switch(i)
			{
			case 0:
				drawText(132, 535 + (i * 37) - titleCam + offset, "BACK TO MAIN", titleSelect == i, 0);
				break;
			case 1:
				drawText(132, 535 + (i * 37) - titleCam + offset, "QUIT", titleSelect == i, 0);
				break;
			case 2:
				drawText(132, 535 + (i * 37) - titleCam + offset, "UNLOCKABLES!", titleSelect == i, 0);
				break;
			}
		}

		//title
		drawText(333, 485 - titleCam, "PROFILE MENU", 1, 1);
		drawText(332, 484 - titleCam, "PROFILE MENU", 0, 1);

		//arrows
		blit(arrows.frame(0,1), 8 - arrow1X, 600 - titleCam, screen);
		blit(arrows.frame(1,0), 600 + arrow2X, 600 - titleCam, screen);
	}

	//profile details
	if((titleMenu == MENU_LEVELSELECT || titleMenu == MENU_LEVELOPTIONS) && activeProfile)
	{
		char temp[255] = "";

		drawText(480, 560 - titleCam, activeProfile->data->name, 0, 1);
		sprintf(temp,"TOKENS: %i",activeProfile->data->tokens);
		drawText(480, 600 - titleCam, temp, 0, 1);

		if(titleMenu == MENU_LEVELSELECT && mapSet == MS_NEW && prizeCount() < 2)
		{
			drawText(480, 640 - titleCam, "COLLECT 2", 0, 1);
			drawText(480, 660 - titleCam, "BAGS OF MEGA", 0, 1);
			drawText(480, 680 - titleCam, "TATERS TO UNLOCK", 0, 1);
			drawText(480, 700 - titleCam, "THE NEW LEVELS.", 0, 1);
			drawText(480, 720 - titleCam, "", 0, 1);
			sprintf(temp, "%i BAGS TO GO!", 2 - prizeCount());
			drawText(480, 740 - titleCam, temp, 0, 1);
		}

		if(titleMenu == MENU_LEVELSELECT && mapSet == MS_MASTER && prizeCount() < 20)
		{
			drawText(480, 640 - titleCam, "ONLY PLAYERS WHO", 0, 1);
			drawText(480, 660 - titleCam, "HAVE PROVEN", 0, 1);
			drawText(480, 680 - titleCam, "THEMSELVES CAN", 0, 1);
			drawText(480, 700 - titleCam, "PLAY THE MASTER", 0, 1);
			drawText(480, 720 - titleCam, "LEVELS.", 0, 1);
			sprintf(temp, "%i BAGS TO GO!", 20 - prizeCount());
			drawText(480, 740 - titleCam, temp, 0, 1);
		}

		if(titleMenu == MENU_LEVELSELECT && mapSet == MS_COOP && (activeProfile->data->levelsComplete[0] < 12 || activeProfile->data->levelsComplete[1] < 12))
		{
			drawText(480, 640 - titleCam, "COMPLETE ALL", 0, 1);
			drawText(480, 660 - titleCam, "FACTORY AND", 0, 1);
			drawText(480, 680 - titleCam, "LAB LEVELS TO", 0, 1);
			drawText(480, 700 - titleCam, "PLAY THE TWO", 0, 1);
			drawText(480, 720 - titleCam, "PLAYER LEVELS!", 0, 1);
			drawText(480, 740 - titleCam, "", 0, 1);
		}

		if(titleMenu == MENU_LEVELSELECT && mapSet == MS_CUSTOM && activeProfile->data->levelsComplete[0] < 12)
		{
			drawText(480, 640 - titleCam, "COLLECT 1", 0, 1);
			drawText(480, 660 - titleCam, "BAG OF MEGA", 0, 1);
			drawText(480, 680 - titleCam, "TATERS TO PLAY", 0, 1);
			drawText(480, 700 - titleCam, "CUSTOM LEVELS!", 0, 1);
			drawText(480, 720 - titleCam, "", 0, 1);
			drawText(480, 740 - titleCam, "", 0, 1);
		}
	}

	//version number
	if(DEVVERSION)
	{
		drawText(0, -titleCam, "V1.75 DEV", 0, 0);
		if(!LEVELSKIP)
			drawText(0, -titleCam + 16, "NO LEVEL SKIP", 0, 0);
	}
	else
		drawText(0, -titleCam, "V1.75", 0, 0);

	renderHelp();

	//screen fade
	if(screenFade)
	{
		blitalpha(blackScreen, 0, 0, screen, screenFade);
	}
	
	SDL_Flip(screen);
}

char getInput()
{
	int i;
	for(i = 0; i < 26; i++)
	{
		if(KeyHit(SDLK_a + i))
		{
			return 'A' + i;
		}
	}

	//key 1 / !
	if(KeyHit(SDLK_1))
	{
		if(KeyDown(SDLK_LSHIFT) || KeyDown(SDLK_RSHIFT))
			return '!';
		else
			return '1';
	}

	for(i = 0; i < 10; i++)
	{
		if(KeyHit(SDLK_0 + i))
		{
			return '0' + i;
		}
	}

	if(KeyHit(SDLK_SLASH) && (KeyDown(SDLK_LSHIFT) || KeyDown(SDLK_RSHIFT)) )
		return '?';

	if(KeyHit(SDLK_SEMICOLON) && (KeyDown(SDLK_LSHIFT) || KeyDown(SDLK_RSHIFT)) )
		return ':';

	if(KeyHit(SDLK_QUOTE))
		return '\'';

	if(KeyHit(SDLK_COMMA))
		return ',';

	if(KeyHit(SDLK_MINUS))
		return '-';

	if(KeyHit(SDLK_PERIOD))
		return '.';

	if(KeyHit(SDLK_SPACE))
		return ' ';

	if(KeyHit(SDLK_BACKSPACE))
		return 1;

	if(KeyHit(SDLK_RETURN))
		return 2;

	if(KeyHit(SDLK_ESCAPE))
		return 3;

	return 0;
}

void refreshLevelSelect()
{
	//load all the mini maps - just gets the tileset numbers for the list
	for(int i = 1; i <= LASTMAP; i++)
	{
		levelTileset[i - 1] = readTileset(i);
	}

	//unlock new levels after three bags
	if(titleMenu == MENU_LEVELSELECT && mapSet == MS_NEW && prizeCount() < 2)
	{
		activeProfile->data->levelsComplete[MS_NEW] = 0;
	}
	else
	{
		if(activeProfile->data->levelsComplete[MS_NEW] == 0)
			activeProfile->data->levelsComplete[MS_NEW] = 1;
	}

	//unlock master levels after 20 bags
	if(titleMenu == MENU_LEVELSELECT && mapSet == MS_MASTER && prizeCount() < 20)
	{
		activeProfile->data->levelsComplete[MS_MASTER] = 0;
	}
	else
	{
		if(activeProfile->data->levelsComplete[MS_MASTER] == 0)
			activeProfile->data->levelsComplete[MS_MASTER] = 17;
	}

	//unlock co-op levels after first bag of original and new levels
	if(titleMenu == MENU_LEVELSELECT && mapSet == MS_COOP && (activeProfile->data->levelsComplete[0] < 12 || activeProfile->data->levelsComplete[1] < 12))
	{
		activeProfile->data->levelsComplete[MS_COOP] = 0;
	}
	else
	{
		if(activeProfile->data->levelsComplete[MS_COOP] == 0)
			activeProfile->data->levelsComplete[MS_COOP] = 1;
	}

	//unlock custom levels after 1 bag
	if(titleMenu == MENU_LEVELSELECT && mapSet == MS_CUSTOM && prizeCount() == 0)
	{
		activeProfile->data->levelsComplete[MS_CUSTOM] = 0;
	}
	else
	{
		activeProfile->data->levelsComplete[MS_CUSTOM] = 100;
	}

	//select level
	levelSelect = activeProfile->data->levelsComplete[mapSet];
	if(levelSelect < 1)
		levelSelect = 1;
	if(levelSelect > LASTMAP)
		levelSelect = LASTMAP;

	if(mapSet == MS_CUSTOM)
		levelSelect = 1;

	loadMiniMap(levelSelect, 1);

	//scroll
	levelScroll = levelSelect - 1;

	if(levelScroll < 1)
		levelScroll = 1;

	if(levelScroll > LASTMAP - 5)
		levelScroll = LASTMAP - 5;
}

#endif
