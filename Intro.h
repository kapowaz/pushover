#ifndef __INTROHEADER
#define __INTROHEADER

#include <sdl.h>
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sdl_image.h>
#include <sdl_mixer.h>

//Custom Headers
#include "controls.h"
#include "Video_Funcs.h"
#include "Window_Funcs.h"
#include "SDLFrontEnd.h"
#include "types.h"
#include "LinkedList.h"

extern void inline Timer();
extern int inline DoEvents();

#define CLEARSCREEN SDL_FillRect(screen, NULL, 0x000000);

void MintsoftIntro()
{
	//LOAD IMAGES
	SDL_Surface *Img_Mask, *Img_Background, *Img_Logo;

	Img_Mask	   = IMG_Load("Intro\\LogoMask.ishi"   );
	Img_Background = IMG_Load("Intro\\Background.ishi" );
	Img_Logo	   = IMG_Load("Intro\\LogoFinal.ishi"  );

	SDL_SetColorKey(Img_Mask,       SDL_SRCCOLORKEY, 0xFF00FF);
	SDL_SetColorKey(Img_Background, SDL_SRCCOLORKEY, 0xFF00FF);
	SDL_SetColorKey(Img_Logo,       SDL_SRCCOLORKEY, 0xFF00FF);
	
	unsigned short IntroCount;

	//show logo
	for(IntroCount = 0; IntroCount <= 320; IntroCount += 6)
	{
		blit(Img_Background, IntroCount - 128, 208, screen);
		blit(Img_Mask, 0, 208, screen);

		Timer();
		
		DoEvents();
		if(KeyDown(SDLK_ESCAPE))
			exit(1);

		SDL_Flip(screen);
		//CLEARSCREEN;
	}
	
	//fade in final logo and display
	for(IntroCount = 0; IntroCount < 512; IntroCount += 5)
	{
		unsigned short Alpha;
		Alpha = IntroCount;
		if(Alpha > 255) Alpha = 255;

		blit(Img_Background, 192, 208, screen);
		blit(Img_Mask, 0, 208, screen);
		blitalpha(Img_Logo, 192, 208, screen, Alpha);

		Timer();
		
		DoEvents();
		if(KeyDown(SDLK_ESCAPE))
			exit(1);

		SDL_Flip(screen);
		//CLEARSCREEN;
	}

	//fade out final logo
	for(IntroCount = 255; IntroCount > 0; IntroCount -= 5)
	{
		blitalpha(Img_Logo, 192, 208, screen, IntroCount);

		Timer();
		
		DoEvents();
		if(KeyDown(SDLK_ESCAPE))
			exit(1);

		SDL_Flip(screen);
		CLEARSCREEN;
	}

	//clear images from memory
	SDL_FreeSurface(Img_Mask);
	SDL_FreeSurface(Img_Background);
	SDL_FreeSurface(Img_Logo);
}
#endif