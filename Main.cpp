/*
	TODO:
	-> Mouse-over to display the name of a domino. Click for further explanation
	-> Key redefine for Esc and Pause
	-> Don't allow profiles with empty names.
	-> Sort out triggers!
	-> Antigravs roll through the top of other dominoes?
	-> Triggers on splitters?
	-> Mimics - one crash, all crash? spectacular failure
	-> Destroy ladder to drop ascenders off it
	-> "hide message box" button so you can see where the puzzle failed
	-> restart from before push option anywhere
	-> hall of fame?
	-> rubble falling out of level
	-> ascender leaning on delay - sham sound
	-> no "hai!" mode
	-> first bag of mega taters is set to "got" when you create a new profile - maybe
	-> 2 players. brilliant fun to code :D - almost done actually!
*/

#define DEVVERSION 1
#define LEVELSKIP 1

#define MS_ORIGINAL 0
#define MS_NEW 1
#define MS_MASTER 2
#define MS_COOP 3
#define MS_CUSTOM 4

#define CLOSEDDOOR 7
#define OPENDOOR 11

/*************************
HEADERS
**************************/
#include <sdl.h>
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sdl_image.h>
#include <sdl_mixer.h>
#include <fstream>
#include <time.h>

/************************* 
PROTOTYPES
**************************/
void inline LoadImages();
void inline LoadTypes();
void inline Render(int = 0);
void inline Process();
void inline Timer();
void inline Help();
void inline Pause();
void inline DoMouse();
void inline LoadSounds();

//video recording / playing functions
void beginVideoRecord(); //sets recording at frame 0
void endVideoRecord();   //stops recording
void putVideoInput();    //stores player input into arrays
void saveVideo();        //writes vid to file

void advanceVideoPlay(); //adds one to frame, stops video if at the end
void beginVideoPlay();   //loads vid from file, sets frame 0
void endVideoPlay();     //sets playing to 0
bool contHitVideo(int cont);    //replaces keyHit
bool contDownVideo(int cont);   //replaces keyDown

void game();
void fadeOut();
void blankPause(int time = 1000);
int hours();
bool dominoPresent(int dom);

void drawText(int, int, const char *, int, bool, int = 255);

int frameCount(0), lastFrameCount(0);

void title();

//video properties
bool recording(false);
bool playing(false);
int frame(0);
int totalFrames(0);

//Custom Headers
//#include "mikmod.h"
#include "controls.h"
#include "Video_Funcs.h"
#include "Window_Funcs.h"
#include "SDLFrontEnd.h"
#include "LinkedList.h"
#include "types.h"
#include "intro.h"
#include "Anim Image.h"
#include "Help.h"
#include "Tilesets.h"
#include "Dom_GI_Map_Decls.h"
#include "Joystick.h"
#include "Config.h"
#include "Sounds.h"
#include "Music.h"
#include "Profiles.h"
#include "Numbers.h"
#include "Message.h"
#include "String Info.h"
#include "Effects.h"
#include "Dominoes.h"
#include "GI.h"
#include "Maps.h"
#include "Quavers.h"
#include "Awards.h"
#include "Title.h"
#include "Video.h"

/*************************
MACRO's
**************************/
#define GAMETITLE		"Pushover - Ishisoft"
#define CLEARSCREEN		SDL_FillRect(screen, NULL, 0x000000);
#define FPS 35
#define PAUSEBUTTON SDLK_RETURN

//#define USESMOUSE
#define HIDEMOUSE

//uncomment this to enable the protection
//#define INITIALISEPROTECTION
#ifdef INITIALISEPROTECTION
#define MINSPACESIZE 129720300
#define MAXSPACESIZE 129720400
#define FILESYS "FAT"
#define VOLUMETITLE "MintSoftFG"
#endif

/*************************
GLOBALS
**************************/
bool EndOfGame=false;
char priority=0;
int ticks=0;
int oldticks=0;
int TicksPerFrame=1000/FPS;
SDL_Surface *screen;
bool commandlined = false;

WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	//count arguments
	int argc = 0, i = 0;
	while (lpCmdLine[i] != 0) if (lpCmdLine[i++]==32) argc++;
	//end count

	loadConfig();

	InitSDL(true,640,480,32,true,1 - windowed);

	//start mikmod
	/*
	MikMod_RegisterAllDrivers();
	MikMod_RegisterAllLoaders(); //Loader(load_med);

	//md_mode = DMODE_HQMIXER | DMODE_STEREO | DMODE_SURROUND | DMODE_16BITS | DMODE_SOFT_MUSIC | DMODE_SOFT_SNDFX;
	//md_mode = 0;
	if (MikMod_Init("")) {
        fprintf(stderr, "Could not initialize sound, reason: %s\n", MikMod_strerror(MikMod_errno));
        return 1;
    }
	*/

	//initialise sound
	/*
	int audio_rate = 44100;
	Uint16 audio_format = AUDIO_S16SYS;
	int audio_channels = 2;
	int audio_buffers = 2048;//4096;
 
	if(Mix_OpenAudio(audio_rate, audio_format, audio_channels, audio_buffers) != 0) {
		fprintf(stderr, "Unable to initialize audio: %s\n", Mix_GetError());
		exit(1);
	}
	*/
	

	SDL_WM_SetCaption(GAMETITLE, NULL);

	//HIDEMOUSE if required
#ifdef HIDEMOUSE
	SDL_ShowCursor(0);
#endif
	//misc shit here
	loadHelp();
	LoadImages();
	LoadTypes();
	LoadSounds();
	SetControls();

	setMessageSize(12,7);

	//make some ants!
	ants.addback(new classGI(0));
	ants.addback(new classGI(1));

	ants.first->data->setControls(0);
	ants.first->data->otherGI = ants.last;

	ants.last->data->setControls(3);
	ants.last->data->otherGI = ants.first;

	renderFirst = ants.first;

	loadProfiles();
	loadTitle();

	//load map from command line?
	{
		int mapToLoad = -1;
		mapSet = 0;

		char *CL = GetCommandLine();
		//MessageBox(NULL,CL,"a",MB_OK);
		int i, arg(0), number;
		for(i = 1; i < strlen(CL); i++)
		{
			if(CL[i] == '-' && CL[i - 1] == '-')
			{
				number = 0;
				i++;
				while(CL[i] != ' ')
				{
					number *= 10;
					number += (CL[i] - 48);
					i++;
				}

				switch(arg)
				{
				case 0:
					mapToLoad = number;
				case 1:
					mapSet = number;
				}

				arg++;
				
			}
		}

		if(mapToLoad != -1)
		{
			commandlined = true;
			loadMap(mapToLoad);
			game();
		}
		else
		{
			if(!DEVVERSION) MintsoftIntro();
			SDL_Delay(200);
			title();
		}
	}

	Mix_CloseAudio();
	//MikMod_Exit();

	return 0;
}

bool entrance(int x, int y)
{
	if(doorX == x && doorY == y)
		return 1;
	if(door2X == x && door2Y == y)
		return 1;

	return 0;
}

bool dominoPresent(int dom)
{
	int x, y;
	for(x = 0; x < MAPWIDTH; x++)
	{
		for(y = 0; y < MAPHEIGHT2; y++)
		{
			if(domino[x][y][0] == dom)
				return true;
		}
	}

	return false;
}

void gameHelpMessages()
{
	if(activeProfile)
	{
		bool inverse = false;
		if(ants.first->data->GIY < MAPHEIGHT / 2)
			inverse = true;

		//help messages
		if(activeProfile->data->helpDisplayed[0] == false && dominoPresent(D_STOPPER) && mapSet == 0)
		{
			setHelp(HELP_STOPPER, 45, inverse);
			activeProfile->data->helpDisplayed[0] = true;
		}
		else if(activeProfile->data->helpDisplayed[1] == false && dominoPresent(D_TUMBLER) && mapSet == 0)
		{
			setHelp(HELP_TUMBLER, 45, inverse);
			activeProfile->data->helpDisplayed[1] = true;
		}
		else if(activeProfile->data->helpDisplayed[2] == false && dominoPresent(D_BRIDGER) && mapSet == 0)
		{
			setHelp(HELP_BRIDGER, 45, inverse);
			activeProfile->data->helpDisplayed[2] = true;
		}
		else if(activeProfile->data->helpDisplayed[3] == false && dominoPresent(D_VANISHER) && mapSet == 0)
		{
			setHelp(HELP_VANISHER, 45, inverse);
			activeProfile->data->helpDisplayed[3] = true;
		}
		else if(activeProfile->data->helpDisplayed[4] == false && dominoPresent(D_TRIGGER) && mapSet == 0)
		{
			setHelp(HELP_TRIGGER, 45, inverse);
			activeProfile->data->helpDisplayed[4] = true;
		}
		else if(activeProfile->data->helpDisplayed[5] == false && dominoPresent(D_DELAY2) && mapSet == 0)
		{
			setHelp(HELP_DELAY, 45, inverse);
			activeProfile->data->helpDisplayed[5] = true;
		}
		else if(activeProfile->data->helpDisplayed[6] == false && dominoPresent(D_ASCENDER) && mapSet == 0)
		{
			setHelp(HELP_ASCENDER, 45, inverse);
			activeProfile->data->helpDisplayed[6] = true;
		}
		else if(activeProfile->data->helpDisplayed[7] == false && dominoPresent(D_SPLITTER1) && mapSet == 0)
		{
			setHelp(HELP_SPLITTER, 45, inverse);
			activeProfile->data->helpDisplayed[7] = true;
		}
		else if(activeProfile->data->helpDisplayed[8] == false && dominoPresent(D_EXPLODER) && mapSet == 0)
		{
			setHelp(HELP_EXPLODER, 45, inverse);
			activeProfile->data->helpDisplayed[8] = true;
		}
		else if(activeProfile->data->helpDisplayed[9] == false && dominoPresent(D_COUNT1) && mapSet == 1)
		{
			setHelp(HELP_COUNTERS, 45, inverse);
			activeProfile->data->helpDisplayed[9] = true;
		}
		else if(activeProfile->data->helpDisplayed[10] == false && (mapSet == 0 || mapSet == 1))
		{
			int x,y,i;
			i = 0;
			//count number of triggers
			for(x = 0; x < MAPWIDTH; x++)
			{
				for(y = 0; y < MAPHEIGHT2; y++)
				{
					i += (domino[x][y][0] == D_TRIGGER);
				}
			}
			if(i > 1)
			{
				setHelp(HELP_MULTITRIGGERS, 45, inverse);
				activeProfile->data->helpDisplayed[10] = true;
			}
		}
	}
	
}

void game()
{
	if(activeProfile)
	{
		GITokens = activeProfile->data->tokens;
		//if(GITokens)
		//	MessageBox(NULL,"a","a",MB_OK);

		gameHelpMessages();
	}

	while(!EndOfGame && DoEvents())
	{
		putVideoInput();
		advanceVideoPlay();

		//DoEvents();	// Poll for events, and handle the ones we care about.
		Process();	//uses the results of the polling and process it all
		processHelp();
		if(!newMap)
		{
			if(KeyDown(SDLK_f) && playing)
			{
				if(frame % 3 == 0)
					Render();
			}
			else
			{
				Render();	//draw the results
				Timer();	//keep the FPS in check
			}
		}
		else
			newMap = 0;
	}

	fadeOut();
	exit(0);
}

void inline Process()
{
	bool reload = false;

	screenFade -= 48;
	if(screenFade < 0)
		screenFade = 0;

	#ifdef USESMOUSE
		DoMouse();
	#endif
	
	if(KeyDown(SDLK_ESCAPE))
	{
		EndOfGame=true;
	}

	/*
	if(KeyDown(SDLK_F1))
	{
		Help();
	}

	if(KeyDown(PAUSEBUTTON))
	{
		Pause();
	}
	*/

	//pause
	if(KeyHit(SDLK_p))
	{
		playSound(-1, SND_BEEP1, 0, 320);
		switch(messageBox(MSG_PAUSE))
		{
		case 6: //continue
			//do nowt
			break;
		case 7: //retry
			fadeOut();
			loadMap(currentMap);
			newMap = 1;
			return;
			break;
		case 8: //quit
			fadeOut();
			if(!activeProfile)
			{
				exit(0);
			}
			else
			{
				blankPause();
				title();
			}
			//EndOfGame = true;
			break;
		}
	}

	//open / close doors
	switch(levelState)
	{
	case LS_OPENDOOR:
		doorFrameChange += 0.33;
		if(doorFrameChange >= 1)
		{
			doorFrameChange--;
			background[doorX][doorY]++;
			background[door2X][door2Y]++;
			if(background[doorX][doorY] == 11)
			{
				levelState = LS_CLOSEDOOR;
			}
		}

		break;

	case LS_CLOSEDOOR:
		if(ants.first->data->GIState != GI_EXIT)
		{
			doorFrameChange += 0.33;
			if(doorFrameChange >= 1)
			{
				doorFrameChange--;
				background[doorX][doorY]--;
				background[door2X][door2Y]--;
				if(background[doorX][doorY] == 7)
				{
					playSound(-1, SND_CLOSE_DOOR, 0, doorX * 32);
					levelState = LS_PLAYING;
				}
			}
		}

		break;

	case LS_OPENEXIT:
		doorFrameChange += 0.33;
		if(doorFrameChange >= 1)
		{
			doorFrameChange--;
			//background[exitX][exitY]++;
			//if(background[exitX][exitY] > 11)
			//{
				//state will change when GI enters the exit
			//	background[exitX][exitY] = 11;
			//}

			int x, y;

			for(x = 0; x < MAPWIDTH; x++)
			{
				for(y = 0; y < MAPHEIGHT; y++)
				{
					if(background[x][y] >= CLOSEDDOOR && background[x][y] <= OPENDOOR && !entrance(x, y))
					{
						background[x][y]++;
						if(background[x][y] > OPENDOOR)
							background[x][y] = OPENDOOR;
					}
				}
			}
		}
		break;

	case LS_CLOSEEXIT:
		doorFrameChange += 0.33;
		if(doorFrameChange >= 1)
		{
			doorFrameChange--;
			//background[exitX][exitY]--;

			//close doors
			int x, y;
			for(x = 0; x < MAPWIDTH; x++)
			{
				for(y = 0; y < MAPHEIGHT; y++)
				{
					if(background[x][y] >= CLOSEDDOOR && background[x][y] <= OPENDOOR && !entrance(x, y))
					{
						background[x][y]--;

						if(background[x][y] < CLOSEDDOOR)
						{
							background[x][y] = CLOSEDDOOR;

							playSound(-1, SND_CLOSE_DOOR, 0, 320);

							//end and save vid
							endVideoRecord();
							saveVideo();

							SDL_Delay(500);

							//completed level - but out of time..
							if(negative)
							{
								int ret = messageBox(MSG_TOOSLOW);
								//token - go to next level anyway
								if(ret == 6)
								{
									GITokens--;
									if(activeProfile)
									{
										activeProfile->data->tokens = GITokens;
										saveProfiles();
									}
								}
								//restart level
								if(ret == 7)
								{
									fadeOut();
									loadMap(currentMap);
									newMap = 1;
									return;
								}
								//quit to title
								if(ret == 8)
								{
									fadeOut();
									if(!activeProfile)
									{
										exit(0);
									}
									else
									{
										blankPause();
										title();
									}
								}
							}

							if(!negative)
							{
								GITokens++;
								if(GITokens > 100)
									GITokens = 100;
								messageBox(MSG_TOKENGAIN);
							}

							//set level as complete
							if(activeProfile)
							{
								if(activeProfile->data->levelsComplete[mapSet] <= currentMap)
								{
									activeProfile->data->levelsComplete[mapSet] = currentMap + 1;
									levelSelect = currentMap + 1;
								}
								activeProfile->data->tokens = GITokens;
								saveProfiles();
								//char debug[255] = "";
								//sprintf(debug,"%i  ---  %i",activeProfile->data->tokens,GITokens);
								//MessageBox(NULL,debug, debug,MB_OK);
							}

							fadeOut();

							//recieve a snack!
							checkPrize();

							//that was the final level! :O
							if(currentMap == LASTMAP)
							{
								fadeOut();
								title();
							}

							//next map is blank
							if(levelTileset[currentMap] == 0)
							{
								fadeOut();
								title();
							}

							loadMap(currentMap + 1);
							newMap = 1;
							if(activeProfile)
							{
								gameHelpMessages();
							}

							return;
						}

					}
				}
			}
		}

		break;
	}

	//delayed message
	if(messageDelayStyle != 0)
	{
		messageDelay--;
		if(!messageDelay)
		{
			int ret = messageBox(messageDelayStyle);
			messageDelayStyle = 0;

			//use token = reload from push
			if(ret == 6)
			{
				GITokens--;
				if(activeProfile)
				{
					activeProfile->data->tokens = GITokens;
					saveProfiles();
				}
				fadeOut();
				loadMap(currentMap,0,1);
				newMap = 1;
				return;
			}
			//replay level
			if(ret == 7)
			{
				//MessageBox(NULL,"a","a",MB_OK);
				fadeOut();
				loadMap(currentMap);
				newMap = 1;
				return;
				//reload = true;
			}
			//quit
			if(ret == 8)
			{
				fadeOut();
				if(!activeProfile)
				{
					exit(0);
				}
				else
				{
					blankPause();
					title();
				}
			}
		}
	}

	if(DEVVERSION && LEVELSKIP)
	{
		//switch map set
		if(KeyHit(SDLK_F2))
		{
			mapSet = 0;
			loadMap(currentMap);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_F3))
		{
			mapSet = 1;
			loadMap(currentMap);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_F4))
		{
			mapSet = 2;
			loadMap(currentMap);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_F5))
		{
			mapSet = 3;
			loadMap(currentMap);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_F6))
		{
			mapSet = 4;
			loadMap(currentMap);
			newMap = 1;
			return;
		}

		//restart
		if(KeyHit(P1Cont.fire1))
		{
			loadMap(currentMap);
			newMap = 1;
			return;
		}
		//previous
		if(KeyHit(P1Cont.fire2) && currentMap > 1)
		{
			loadMap(currentMap - 1);
			newMap = 1;
			return;
		}
		//skip
		if(KeyHit(P1Cont.fire3) && (currentMap < LASTMAP || DEVVERSION))
		{
			loadMap(currentMap + 1);
			newMap = 1;
			return;
		}
		//skip levels
		if(KeyHit(SDLK_1))
		{
			loadMap(10);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_2))
		{
			loadMap(20);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_3))
		{
			loadMap(30);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_4))
		{
			loadMap(40);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_5))
		{
			loadMap(50);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_6))
		{
			loadMap(60);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_7))
		{
			loadMap(70);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_8))
		{
			loadMap(80);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_9))
		{
			loadMap(90);
			newMap = 1;
			return;
		}
		if(KeyHit(SDLK_0))
		{
			loadMap(100);
			newMap = 1;
			return;
		}
	}

	if(DEVVERSION)
	{
		//play video
		if(KeyHit(SDLK_v))
		{
			loadMap(currentMap, 0, 0, 1);
			newMap = 1;
			return;
		}
	}

	if(reload)
	{
		fadeOut();
		loadMap(currentMap);
		newMap = 1;
		return;
	}
	
	processEffects();
	mimics = 0;
	processDominoes();
	if(levelState == LS_CLOSEDOOR || levelState == LS_PLAYING || levelState == LS_OPENEXIT)
	{
		//for(antEl = ants.first; antEl != NULL; NE(antEl))
		//{
			ants.first->data->process();
			ants.last->data->process();
		//}
	}

	if(mimics)
	{
		hitMimics();
	}

	//ice cave background movement
	if(gameTileset == 14 || gameTileset == 32)
		++BGPos %= 640;
	//sky temple BG movement
	if(gameTileset == 18 || gameTileset == 36)
		templeBGAngle += 0.006;

	updateTimer();

	//MikMod_Update();
}

void Timer()
{
	frameCount++;

	ticks=SDL_GetTicks();
	if( (ticks-oldticks) < TicksPerFrame)
	{
		SDL_Delay(TicksPerFrame - (ticks-oldticks));
	}
	oldticks = SDL_GetTicks();
}

void Help()
{
}

void Pause()
{
}

void DoMouse()
{
}

void inline LoadImages()
{
	/*
	load the images here using sdl_image:
	image=IMG_Load("image.png");
	if(!image) { MessageBox(NULL,"Error","Missing Image",MB_OK); }
	*/

	blackScreen = SDL_CreateRGBSurface(0, 640, 480, 32, 0, 0, 0, 0);

	babyDomino.load("Resource\\Image\\Title\\Baby Domino.ishi",3,9,14,2);

	loadDominoImages(1);
	loadGIImages();
	loadNumberImages();
	loadMessageImages();
	loadEffectsImages();
	loadPrize();
}

void inline LoadTypes()
{
	//add the types onto the lists, load files etc
}

void inline LoadSounds()
{
	int i;
	char filename[255] = "";

	for(i = 0; i < SOUNDS; i++)
	{
		sprintf(filename, "Resource\\Sound\\%i.wav", i + 1);
		sounds[i] = Mix_LoadWAV(filename);

		if(sounds[i] == NULL) {
			fprintf(stderr, "Unable to load WAV file: %s\n", Mix_GetError());
		}
	}
}

void inline Render(int m)
{
	if(mapSet != 0) CLEARSCREEN;
	//blit(BG,10,10,screen);
	
	if(m == 0 || m == 1)
	{
		drawMap();
		drawEffects();
		drawLevelCounter(currentMap);
		drawTimer();
	}
	if(m == 1 || m == 2)
		drawMessage();

	renderHelp();

	//screen fade
	if(screenFade)
	{
		blitalpha(blackScreen, 0, 0, screen, screenFade);
	}

	SDL_Flip(screen); 
}

void fadeOut()
{
	SDL_Surface *temp;
	temp = SDL_CreateRGBSurface(0, 640, 480, 32, 0, 0, 0, 0);

	blit(screen, 0, 0, temp);

	screenFade = 0;

	while(screenFade < 255)
	{
		screenFade += 48;
		if(screenFade > 255)
			screenFade = 255;

		blit(temp, 0, 0, screen);
		blitalpha(blackScreen, 0, 0, screen, screenFade);
		SDL_Flip(screen);
		Timer();
	}
}

void blankPause(int time)
{
	CLEARSCREEN;
	SDL_Flip(screen);
	//Mix_HaltMusic();
	Mix_FadeOutMusic(time / 2);
	SDL_Delay(time);
}

int hours()
{
	int hour(0);

	time_t temp = time(NULL);
	char temp2[255];
	sprintf(temp2,ctime(&temp));
	hour += static_cast<int>((strpbrk(temp2, ":") - 1)[0] - '0');
	hour += static_cast<int>((strpbrk(temp2, ":") - 2)[0] - '0') * 10;

	return hour;
}
