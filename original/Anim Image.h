//AnimImage and Font classes - h
//updated 03/05/2006 by Ishi

#ifndef __ANIM_IMAGE_H
#define __ANIM_IMAGE_H

#include <sdl.h>
#include <sdl_image.h>

//###############################################################################################

class AnimImage {
protected:
	SDL_Surface **image;
	unsigned int frames, width, height, xFrames, yFrames;
public:
	AnimImage();
	AnimImage(const AnimImage &);
	AnimImage& operator = (const AnimImage &);

	virtual ~AnimImage();

	bool load(const char * filename, unsigned int _width, unsigned int _height, unsigned int _xFrames, unsigned int _yFrames, unsigned int transparent = 0xFF00FF);

	SDL_Surface *frame(unsigned int x, unsigned int y = 0);
};

//###############################################################################################

class Font : public AnimImage {
protected:
	char *characterList;
	bool caseSensitive;
public:
	Font();
	Font(const Font &);
	Font& operator = (const Font &);

	~Font();

	bool load(const char * filename, const char * _characterList, unsigned int _width, unsigned int _height, unsigned int colours = 1, bool _caseSensitive = false, int transparent = 0xFF00FF);

	void blitText(int x, int y, char *text, SDL_Surface *destination, int colour = 0, bool centreX = false, bool centreY = false);

};

//##############################################################################################

void AnimImage_blit(SDL_Surface *image, int x, int y , SDL_Surface *target);

#endif