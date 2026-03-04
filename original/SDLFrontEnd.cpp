//---------------------------
//HEADERS
//---------------------------
#include "sdl.h"
#include "SDLFrontEnd.h"
//#include "Window_Funcs.h"
//#include "Joystick.h"
#include <stdlib.h>
#include <SDL_mixer.h>
#include "LinkedList.h"
#include "Anim Image.h"
#include "classGI.h"

#define SNDFREQ 44100
#define SNDCHANS 2
#define SNDTYPE AUDIO_S16
#define SNDCHNKSIZE 4096

//extern void clearJoy();
//extern bool joyHit[4];
//extern bool joyDown[4];
//extern bool joyOn;

extern List<classGI> ants;
extern ListElement<classGI> *antEl;

//--------------------------
//GLOBALS 
//--------------------------
 SDL_Event event;
extern SDL_Surface *screen;

int DoEvents()
{
	static int loops = 0;
	if(loops < 5)
	{
		loops++;
		if(loops == 5)
		{
			for(antEl = ants.first; antEl != NULL; NE(antEl))
			{
				antEl->data->joyDown[4] = 0;
			}
		}
	}

	for(antEl = ants.first; antEl != NULL; NE(antEl))
	{
		if(antEl->data->joyOn) antEl->data->clearJoy();
	}

	while (SDL_PollEvent(&event)) 
	{
		switch (event.type) 
		{
		case SDL_KEYDOWN:
		{
		  sdl_key[event.key.keysym.sym]=true;
		}
		break;
		case SDL_KEYUP:
			{
			// If escape is pressed, return (and thus, quit)
			sdl_key[event.key.keysym.sym]=false;
			break;
			}
		case SDL_QUIT:
			return(0);

		case SDL_JOYAXISMOTION:
		{
			for(antEl = ants.first; antEl != NULL; NE(antEl))
			{

				if(antEl->data->joyOn)
				{
				
					if(event.jaxis.which == antEl->data->playerNum)
					{

						switch(event.jaxis.axis)
						{
							case 1: // joy y
							if(event.jaxis.value < -25600) //up
							{
								antEl->data->joyHit[0] = true;
								antEl->data->joyDown[0] = true;
					
								antEl->data->joyDown[1] = false;
							}
							else if(event.jaxis.value > 25600) //down
							{
								antEl->data->joyHit[1] = true;
								antEl->data->joyDown[1] = true;

								antEl->data->joyDown[0] = false;
							}
							else
							{
								antEl->data->joyDown[0] = false;
								antEl->data->joyDown[1] = false;
							}
							break;

							case 0: // joy x
							if(event.jaxis.value < -25600) //left
							{
								antEl->data->joyHit[2] = true;
								antEl->data->joyDown[2] = true;

								antEl->data->joyDown[3] = false;
							}
							else if(event.jaxis.value > 25600) //right
							{
								antEl->data->joyHit[3] = true;
								antEl->data->joyDown[3] = true;

								antEl->data->joyDown[2] = false;
							}
							else
							{
								antEl->data->joyDown[2] = false;
								antEl->data->joyDown[3] = false;
							}
							break;
						}

					}
				}
			}
			break;
		}

		case SDL_JOYBUTTONDOWN:
		for(antEl = ants.first; antEl != NULL; NE(antEl))
		{
			if ( event.jbutton.button == 0 && antEl->data->joyOn) 
			{
				if(event.jbutton.which == antEl->data->playerNum)
				{
					antEl->data->joyHit[4] = true;
					antEl->data->joyDown[4] = true;
				}
			}
		}
		break;

		case SDL_JOYBUTTONUP:
		for(antEl = ants.first; antEl != NULL; NE(antEl))
		{
			if ( event.jbutton.button == 0  && antEl->data->joyOn) 
			{
				if(event.jbutton.which == antEl->data->playerNum)
				{
					antEl->data->joyDown[4] = false;
				}
			}
		}
		break;

		}
	}
	return 1;
}
void blit(SDL_Surface *image, int x, int y , SDL_Surface *target)
{
	SDL_Rect rcDest = { x, y, 0, 0 };
	SDL_BlitSurface ( image, NULL, target, &rcDest );
}

void blit(SDL_Surface *image, float x, float y , SDL_Surface *target)
{
	SDL_Rect rcDest = { (int)x, (int)y, 0, 0 };
	SDL_BlitSurface ( image, NULL, target, &rcDest );
}
void blitalpha(SDL_Surface *image, unsigned int x, unsigned int y , SDL_Surface *target, int alpha)
{
	SDL_SetAlpha(image,SDL_SRCALPHA, alpha);

	SDL_Rect rcDest = { x, y, 0, 0 };
	SDL_BlitSurface ( image, NULL, target, &rcDest );

	SDL_SetAlpha(image,SDL_SRCALPHA, SDL_ALPHA_OPAQUE);
}

/*
void blitCircle(unsigned int x, unsigned int y, unsigned int radius, int colour)
{
	for(int deg=0; deg<360;++deg)
		PutPixel(screen,x+(int)(radius*sin(deg*0.017453)),y+(int)(radius*cos(deg*0.017453)),colour);// *0.017453 for deg to rad
}
*/
int InitSDL(bool joystick,int xres, int yres, int depth, bool usessound, bool fullscreen)
{
	if(!joystick)
	{
		if ( SDL_Init(SDL_INIT_VIDEO| SDL_INIT_AUDIO) < 0 ) 
		{
			fprintf(stderr, "Unable to init SDL: %s\n", SDL_GetError());
			exit(1);
		}
	}
	else
	{
		if ( SDL_Init(SDL_INIT_VIDEO | SDL_INIT_JOYSTICK | SDL_INIT_AUDIO) < 0 ) 
		{
			fprintf(stderr, "Unable to init SDL: %s\n", SDL_GetError());
			exit(1);
		}
	}
	atexit(SDL_Quit);
	if(fullscreen)
		screen = SDL_SetVideoMode(xres, yres, depth, SDL_FULLSCREEN);
	else
		screen = SDL_SetVideoMode(xres, yres, depth, SDL_SWSURFACE);

	if ( screen == NULL ) 
	{
		fprintf(stderr, "Unable to set video mode: %s\n", SDL_GetError());
		exit(1);
	}
	if(usessound)
	{
		if(Mix_OpenAudio(SNDFREQ, SNDTYPE, SNDCHANS, SNDCHNKSIZE))
		{
			fprintf(stderr, "Error initializing SDL_mixer: %s\n", Mix_GetError());
			exit(1);
		}
	}
	return 0;
}