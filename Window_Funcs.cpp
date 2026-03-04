//--------------------------------------------------------------------------------------------------------------------------
//  Headers
//--------------------------------------------------------------------------------------------------------------------------

#ifndef WIN32_LEAN_AND_MEAN
  #define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>
#include <SDL.h>
#include "Window_Funcs.h"

//--------------------------------------------------------------------------------------------------------------------------
//  Globals
//--------------------------------------------------------------------------------------------------------------------------

bool sdl_key[330]; // 330 to be safe (max is 322)
bool sdl_key_pressed[sizeof(sdl_key)/sizeof(sdl_key[0])];

bool cleared_keylist = false;
int mouse_x = 0;
int mouse_y = 0;
bool mouse_b[4] = { false, false, false };
bool mouse_b_pressed[4] = { false, false, false };

bool device_lost = false;

//--------------------------------------------------------------------------------------------------------------------------
//  HandleEvents
//--------------------------------------------------------------------------------------------------------------------------

bool HandleEvents() {
	if (cleared_keylist == false) {
		cleared_keylist = true;
		memset(sdl_key,0,sizeof(sdl_key));
		memset(sdl_key_pressed,0,sizeof(sdl_key_pressed));
		memset(mouse_b,0,sizeof(mouse_b));
		memset(mouse_b_pressed,0,sizeof(mouse_b_pressed));
	}

	SDL_Event event;
	SDL_Surface * vid_surface;

	while (SDL_PollEvent(&event)) {
		switch(event.type) {

			case SDL_ACTIVEEVENT:
				
				vid_surface = SDL_GetVideoSurface();

				if (vid_surface && vid_surface->flags & SDL_FULLSCREEN) {

					if (event.active.gain == 0) {
						//MessageBox(0,"Deactivate","",0);
						device_lost = true;
					} else {
						//MessageBox(0,"Activate","",0);
						device_lost = false;
					}
				}

				break;

			case SDL_QUIT:
				return false;
				break;

			case SDL_KEYDOWN:
				sdl_key[event.key.keysym.sym] = true;
				break;
			
			case SDL_KEYUP:
				sdl_key[event.key.keysym.sym] = false;
				break;

			case SDL_MOUSEMOTION:
				mouse_x = event.motion.x;
				mouse_y = event.motion.y;
				break;

			case SDL_MOUSEBUTTONDOWN:
				switch (event.button.button) {
					case SDL_BUTTON_LEFT:   mouse_b[1] = true; break;
					case SDL_BUTTON_RIGHT:  mouse_b[2] = true; break;
					case SDL_BUTTON_MIDDLE: mouse_b[3] = true; break;
				}
				break;

			case SDL_MOUSEBUTTONUP:
				switch (event.button.button) {
					case SDL_BUTTON_LEFT:   mouse_b[1] = false; break;
					case SDL_BUTTON_RIGHT:  mouse_b[2] = false; break;
					case SDL_BUTTON_MIDDLE: mouse_b[3] = false; break;
				}
				break;
		}
	}

	// ALT+F4
	if ((sdl_key[SDLK_LALT] || sdl_key[SDLK_RALT]) && sdl_key[SDLK_F4]) {
		return false;
	}

	return true;
}

//--------------------------------------------------------------------------------------------------------------------------
//  KeyHit
//--------------------------------------------------------------------------------------------------------------------------

bool KeyHit(int key, bool reset) {
	if (sdl_key[key] == true) {
		if (sdl_key_pressed[key]) {
			return false;
		} else {
			if(reset) sdl_key_pressed[key] = true;
			return true;
		}
	} else {
		sdl_key_pressed[key] = false;
		return false;
	}
}

//--------------------------------------------------------------------------------------------------------------------------
//  MouseHit
//--------------------------------------------------------------------------------------------------------------------------

bool MouseHit(int btn) {
	if (mouse_b[btn] == true) {
		if (mouse_b_pressed[btn]) {
			return false;
		} else {
			mouse_b_pressed[btn] = true;
			return true;
		}
	} else {
		mouse_b_pressed[btn] = false;
		return false;
	}
}

