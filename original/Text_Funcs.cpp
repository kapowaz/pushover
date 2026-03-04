//--------------------------------------------------------------------------------------------------------------------------
//  Headers
//--------------------------------------------------------------------------------------------------------------------------

#include <SDL.h>
#include <SDL_TTF.h>
#include "Video_Funcs.h"
#include "Text_Funcs.h"

//--------------------------------------------------------------------------------------------------------------------------
//  DrawText
//--------------------------------------------------------------------------------------------------------------------------

void BlitText(TTF_Font * font, SDL_Surface * surface, char * text, int x, int y, int r, int g, int b) {
	SDL_Color col = {r,g,b,0};
	SDL_Surface * text_surface = TTF_RenderText_Solid(font,text,col);
	Blit(text_surface,surface,x,y);
	SDL_FreeSurface(text_surface);
}

