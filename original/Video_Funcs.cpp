//--------------------------------------------------------------------------------------------------------------------------
//  Headers
//--------------------------------------------------------------------------------------------------------------------------

#include <SDL.h>
#include <math.h>
#include "Video_Funcs.h"

//--------------------------------------------------------------------------------------------------------------------------
//  PutPixel
//--------------------------------------------------------------------------------------------------------------------------
/*
void PutPixel(SDL_Surface * screen, int x, int y,int color) {

	if (x < 0) return;
	if (y < 0) return;
	if (x >= screen->w) return;
	if (y >= screen->h) return;

	Uint8 *ubuff8;
	Uint16 *ubuff16;
	Uint32 *ubuff32;
	char c1, c2, c3;

	if(SDL_MUSTLOCK(screen)) {
		if(SDL_LockSurface(screen) < 0) return;
	}

	switch(screen->format->BytesPerPixel) {
		case 1: 
			ubuff8 = (Uint8*) screen->pixels;
			ubuff8 += (y * screen->pitch) + x; 
			*ubuff8 = (Uint8) color;
			break;

		case 2:
			ubuff8 = (Uint8*) screen->pixels;
			ubuff8 += (y * screen->pitch) + (x*2);
			ubuff16 = (Uint16*) ubuff8;
			*ubuff16 = (Uint16) color; 
			break;  

		case 3:
			ubuff8 = (Uint8*) screen->pixels;
			ubuff8 += (y * screen->pitch) + (x*3);
			
			if(SDL_BYTEORDER == SDL_LIL_ENDIAN) {
				c1 = (color & 0xFF0000) >> 16;
				c2 = (color & 0x00FF00) >> 8;
				c3 = (color & 0x0000FF);
			} else {
				c3 = (color & 0xFF0000) >> 16;
				c2 = (color & 0x00FF00) >> 8;
				c1 = (color & 0x0000FF);	
			}

			ubuff8[0] = c3;
			ubuff8[1] = c2;
			ubuff8[2] = c1;
			break;
      
		case 4:
			ubuff8 = (Uint8*) screen->pixels;
			ubuff8 += (y*screen->pitch) + (x*4);
			ubuff32 = (Uint32*)ubuff8;
			*ubuff32 = color;
			break;
	}

	if(SDL_MUSTLOCK(screen)) SDL_UnlockSurface(screen);
}
*/
//--------------------------------------------------------------------------------------------------------------------------
//  GetPixel
//--------------------------------------------------------------------------------------------------------------------------
/*
int GetPixel(SDL_Surface *surface, int x, int y) {
    int bpp = surface->format->BytesPerPixel;
    //Here p is the address to the pixel we want to retrieve 
    Uint8 *p = (Uint8 *)surface->pixels + y * surface->pitch + x * bpp;

    switch(bpp) {
    case 1:
        return *p;

    case 2:
        return *(Uint16 *)p;

    case 3:
        if(SDL_BYTEORDER == SDL_BIG_ENDIAN)
            return p[0] << 16 | p[1] << 8 | p[2];
        else
            return p[0] | p[1] << 8 | p[2] << 16;

    case 4:
        return *(Uint32 *)p;

    default:
        return 0;       // shouldn't happen, but avoids warnings 
    }
}
*/
//--------------------------------------------------------------------------------------------------------------------------
//  ClearImage
//--------------------------------------------------------------------------------------------------------------------------

void ClearImage(SDL_Surface * surface, int col) {
	SDL_Rect rect;
	rect.x = 0;
	rect.y = 0;
	rect.w = surface->w;
	rect.h = surface->h;
	SDL_FillRect(surface,&rect,col);
}

//--------------------------------------------------------------------------------------------------------------------------
//  LoadImageIfNeeded
//--------------------------------------------------------------------------------------------------------------------------

bool LoadImageIfNeeded(SDL_Surface ** surface, char * filename) {
	if (*surface == NULL) {
		*surface = SDL_LoadBMP(filename);
		return true;
	}
	return false;
}

//--------------------------------------------------------------------------------------------------------------------------
//  LoadSurface
//--------------------------------------------------------------------------------------------------------------------------

SDL_Surface * LoadSurface(char * filename, bool col_key) {
	SDL_Surface * tmp = SDL_LoadBMP(filename);
	if (tmp) {
		SDL_Surface * img = SDL_DisplayFormat(tmp);
		SDL_FreeSurface(tmp);
		if (col_key) SDL_SetColorKey(img, SDL_SRCCOLORKEY | SDL_RLEACCEL, 0xFF00FF);
		return img;
	} else {
		return NULL;
	}
}

//--------------------------------------------------------------------------------------------------------------------------
//  Line
//--------------------------------------------------------------------------------------------------------------------------
/*
void Line(SDL_Surface * surface, int x_1, int y_1, int x_2, int y_2, int col) {
	float x1 = (float)x_1;
	float x2 = (float)x_2;
	float y1 = (float)y_1;
	float y2 = (float)y_2;

	float xd = x2-x1;
	float yd = y2-y1;

	float abs_xd = xd; if (abs_xd < 0) abs_xd = -abs_xd;
	float abs_yd = yd; if (abs_yd < 0) abs_yd = -abs_yd;

	float steps;

	if (abs_xd > abs_yd)
		steps = (float)(int)abs_xd;
	else
		steps = (float)(int)abs_yd;

	x2 = xd/steps;
	y2 = yd/steps;
	
	do {
		PutPixel(surface,(int)x1,(int)y1,col);
		x1 += x2;
		y1 += y2;
		steps--;
	} while (steps != -1);
}
*/
//--------------------------------------------------------------------------------------------------------------------------
//  Line32
//--------------------------------------------------------------------------------------------------------------------------
/*
void Line32(SDL_Surface * surface, int x_1, int y_1, int x_2, int y_2, int col) {
	float x1 = (float)x_1;
	float x2 = (float)x_2;
	float y1 = (float)y_1;
	float y2 = (float)y_2;

	float xd = x2-x1;
	float yd = y2-y1;

	float abs_xd = xd; if (abs_xd < 0) abs_xd = -abs_xd;
	float abs_yd = yd; if (abs_yd < 0) abs_yd = -abs_yd;

	float steps;

	if (abs_xd > abs_yd)
		steps = abs_xd;
	else
		steps = abs_yd;

	x2 = xd/steps;
	y2 = yd/steps;
	
	do {
		PutPixel32(surface,(int)x1,(int)y1,col);
		x1 += x2;
		y1 += y2;
		steps--;
	} while (steps != -1);
}

void Line32Safe(SDL_Surface * surface, int x_1, int y_1, int x_2, int y_2, int col) {
	float x1 = (float)x_1;
	float x2 = (float)x_2;
	float y1 = (float)y_1;
	float y2 = (float)y_2;

	float xd = x2-x1;
	float yd = y2-y1;

	float abs_xd = xd; if (abs_xd < 0) abs_xd = -abs_xd;
	float abs_yd = yd; if (abs_yd < 0) abs_yd = -abs_yd;

	float steps;

	if (abs_xd > abs_yd)
		steps = abs_xd;
	else
		steps = abs_yd;

	x2 = xd/steps;
	y2 = yd/steps;
	
	do {
		if (x1 >= 0 && y1 > 0 && x1 < surface->w && y1 < surface->h)
			PutPixel32(surface,(int)x1,(int)y1,col);

		x1 += x2;
		y1 += y2;
		steps--;
	} while (steps != -1);
}
*/
//--------------------------------------------------------------------------------------------------------------------------
//  HSVtoRGB
//--------------------------------------------------------------------------------------------------------------------------
/*
int HSVtoRGB(double h, double s, double v) {
	double r, g, b;
	double i, f, p, q, t;
	if (s == 0) {
		r = v;
		g = v;
		b = v;
	} else {
		h /= 60;
		i = floor(h);
		f = h - i;
		p = v*(1-s);
		q = v*(1-s*f);
		t = v*(1-s*(1-f));
		switch ((int)i) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			default:
				r = v;
				g = p;
				b = q;
				break;
		}
	}
	r *= 255;
	g *= 255;
	b *= 255;
	return ((int)r<<16)|((int)g<<8)|(int)b;
}


*/