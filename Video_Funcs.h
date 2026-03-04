#ifndef _VIDEO_FUNCS_H
#define _VIDEO_FUNCS_H

//--------------------------------------------------------------------------------------------------------------------------
//  Headers
//--------------------------------------------------------------------------------------------------------------------------

#include <SDL.h>

//--------------------------------------------------------------------------------------------------------------------------
//  Function decls
//--------------------------------------------------------------------------------------------------------------------------

void ClearImage(SDL_Surface * surface, int col);
bool LoadImageIfNeeded(SDL_Surface ** surface, char * filename);
SDL_Surface * LoadSurface(char * filename, bool col_key);

/*
int GetPixel(SDL_Surface *surface, int x, int y);
inline int GetPixel32(SDL_Surface *surface, int x, int y);

void PutPixel(SDL_Surface * screen, int x, int y,int color);
inline void PutPixel32(SDL_Surface * screen, int x, int y, Uint32 colour);
inline void PutPixel16(SDL_Surface * screen, int x, int y, Uint32 colour);
inline void Blit(SDL_Surface * surface, SDL_Surface * target, int x, int y);
inline void Blit(SDL_Surface * surface, SDL_Surface * target, int drawx, int drawy, int x, int y, int width, int height);
*/

/*
void Line(SDL_Surface * surface, int x1, int y1, int x2, int y2, int col);
void Line32(SDL_Surface * surface, int x1, int y1, int x2, int y2, int col);
void Line32Safe(SDL_Surface * surface, int x_1, int y_1, int x_2, int y_2, int col);
*/
/*
int HSVtoRGB(double h, double s, double v);

//--------------------------------------------------------------------------------------------------------------------------
//  Inline Functions
//--------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------------
//  GetPixel32
//--------------------------------------------------------------------------------------------------------------------------

inline int GetPixel32(SDL_Surface *surface, int x, int y) {
    Uint8 *p = (Uint8 *)surface->pixels + y * surface->pitch + x * 4;
    return *(Uint32 *)p;
}

//------------------------------------------------------
//  PutPixel32
//------------------------------------------------------

inline void PutPixel32(SDL_Surface * surface, int x, int y, Uint32 colour) { 
	char * loc = (char*)surface->pixels + y*surface->pitch + x*4;
	*(Uint32*)loc = colour;
}

//------------------------------------------------------
//  PutPixel16
//------------------------------------------------------

inline void PutPixel16(SDL_Surface * surface, int x, int y, Uint16 colour) {
	char * loc = (char*)surface->pixels + y*surface->pitch + x*2;
	*(Uint16*)loc = colour;
}

//------------------------------------------------------
//  PutPixel8
//------------------------------------------------------

inline void PutPixel8(SDL_Surface * surface, int x, int y, Uint8 colour) {
	Uint8 * loc = (Uint8*)surface->pixels + y*surface->pitch + x;
	*loc = colour;
}

//--------------------------------------------------------------------------------------------------------------------------
*/
#endif