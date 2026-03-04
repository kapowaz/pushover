//stop it from tripping overitself
#ifndef _FRONTEND_H
#define _FRONTEND_H

//--------------------------
//INCLUDES
//--------------------------
#include "SDL.h"
#include <math.h>

//--------------------------
//GLOBALS 
//--------------------------
extern SDL_Event event;
extern bool sdl_key[330]; // 330 to be safe (max is 322)
extern bool sdl_key_pressed[sizeof(sdl_key)/sizeof(sdl_key[0])];
extern SDL_Surface *screen;

//--------------------------
// PROTOTYPES
//--------------------------
int DoEvents();
bool SDLKeyHit(int key);
bool SDLKeyDown(int key);
void blit(SDL_Surface *image, int x, int y , SDL_Surface *target);
void blit(SDL_Surface *image, float x, float y , SDL_Surface *target);
void blitalpha(SDL_Surface *image, unsigned int x, unsigned int y , SDL_Surface *target, int alpha);
//void blit(SDL_Surface *image, float x, float y , SDL_Surface *target);
//void PutPixel(SDL_Surface * screen, int x, int y,int color);
//void blitCircle(unsigned int x, unsigned int y, unsigned int radius, int colour);
int InitSDL(bool joystick, int xres, int yres, int depth, bool usessound, bool fullscreen);

void updateLedge();

#endif
