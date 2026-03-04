//AnimImage and Font classes - cpp
//updated 02/05/2006 by Ishi

#include "Anim Image.h"
#include <string.h>
#include <ctype.h>

//################################################################################################
//AnimImage function definitions
//################################################################################################

//default c'tor
AnimImage::AnimImage():frames(0), image(NULL) {}

//copy c'tor
AnimImage::AnimImage(const AnimImage & a)
{
	unsigned int i;

	//normal vars
	frames = a.frames;
	width = a.width;
	height = a.height;
	xFrames = a.xFrames;
	yFrames = a.yFrames;

	//surface pointers
	if(a.image != NULL)
	{
		image = new SDL_Surface  *[frames];
		for(i = 0; i < frames; i++)
		{
			image[i] = a.image[i];
		}
	}
	else
	{
		image = NULL;
	}
}

//assignment overload
AnimImage& AnimImage::operator = (const AnimImage & a)
{
	unsigned int i;

	if(this != &a)
	{
		//normal vars
		frames = a.frames;
		width = a.width;
		height = a.height;
		xFrames = a.xFrames;
		yFrames = a.yFrames;

		//surface pointers
		//delete old
		if(image != NULL)
		{
			delete[] image;
		}
		//copy new
		if(a.image != NULL)
		{
			image = new SDL_Surface  *[frames];
			for(i = 0; i < frames; i++)
			{
				image[i] = a.image[i];
			}
		}
	}

	return *this;
}

//d'tor
AnimImage::~AnimImage()
{
	if(image != NULL)
	{
		for(unsigned int i = 0; i < xFrames * yFrames; i++)
		{
			SDL_FreeSurface(image[i]);
		}

		delete[] image;
	}
}

bool AnimImage::load(const char * filename, unsigned int _width, unsigned int _height, unsigned int _xFrames, unsigned int _yFrames, unsigned int transparent)
{
	//frames already loaded
	if(frames > 0)
		return false;
	
	//vars needed
	unsigned int i, x, y;
	SDL_Surface *temp;

	//calculate frames and create array
	frames = _xFrames * _yFrames;
	width = _width;
	height = _height;
	xFrames = _xFrames;
	yFrames = _yFrames;
	image = new SDL_Surface *[frames];

	//create blank images
	i = 0;
	
	for(y = 0; y < yFrames; y++)
	{
		for(x = 0; x < xFrames; x++)
		{
			image[i] = SDL_CreateRGBSurface(0, width, height, 32, 0, 0, 0, 0);
			SDL_SetColorKey(image[i], SDL_SRCCOLORKEY, transparent);
			i++;
		}
	}

	//load temp image
	temp = IMG_Load(filename);
	if(!temp)
		return false;

	//draw to images
	i = 0;
	for(y = 0; y < yFrames; y++)
	{
		for(x = 0; x < xFrames; x++)
		{
			AnimImage_blit(temp, -static_cast<int>(x * width), -static_cast<int>(y * height), image[i]);
			i++;
		}
	}

	//free temp image
	SDL_FreeSurface(temp);

	return true;
}

SDL_Surface *AnimImage::frame(unsigned int x, unsigned int y)
{
	//y is defaulted to 0. user can supply one number to get any tile,
	//or x & y value to get a tile from the position it was in the original image file.
	x = x + (y * xFrames);

	if(x < frames)
		return image[x];
	else
		return NULL;
}

//################################################################################################
//Font function definitions
//################################################################################################

//default c'tor
Font::Font(): AnimImage(), characterList(NULL) {}

//copy c'tor
Font::Font(const Font & f)
{
	
	//call AnimImage copy c'tor
	this->AnimImage::AnimImage(f);

	//normal vars
	caseSensitive = f.caseSensitive;

	//character list char array
	if(f.characterList != NULL)
	{
		characterList = new char[strlen(f.characterList) + 1];
		strcpy(characterList, f.characterList);
	}
	else
	{
		characterList = NULL;
	}
}

//assignment overload
Font& Font::operator = (const Font & f)
{
	if(this != &f)
	{
		//call AnimImage = overload
		this->AnimImage::operator=(f);

		//normal vars
		caseSensitive = f.caseSensitive;

		//character list char array
		//delete old
		if(characterList != NULL)
		{
			delete[] characterList;
		}
		//copy new
		if(f.characterList != NULL)
		{
			characterList = new char[strlen(f.characterList) + 1];
			strcpy(characterList, f.characterList);
		}
	}

	return *this;
}

//d'tor
Font::~Font()
{
	if(characterList != NULL)
	{
		delete[] characterList;
	}
}

bool Font::load(const char * filename, const char * _characterList, unsigned int _width, unsigned int _height, unsigned int colours, bool _caseSensitive, int transparent)
{
	//load images
	bool result;
	result = AnimImage::load(filename, _width, _height, strlen(_characterList), colours, transparent);
	
	//failed..
	if(!result)
		return false;

	//set font properties
	characterList = new char[strlen(_characterList) + 1];
	strcpy(characterList, _characterList);

	caseSensitive = _caseSensitive;

	return true;
}

void Font::blitText(int x, int y, char *text, SDL_Surface *destination, int colour, bool centreX, bool centreY)
{
	if(centreX)
		x -= strlen(text) * width / 2;

	if(centreY)
		y -= height / 2;

	unsigned int i, i2;
	for(i = 0; i < strlen(text); i++)
	{
		for(i2 = 0; i2 < strlen(characterList); i2++)
		{
			if(text[i] == characterList[i2] || (caseSensitive == false && toupper(text[i]) == characterList[i2]))
			{
				AnimImage_blit(image[i2 + (colour * xFrames)], x + i * width, y, destination);
			}
		}
	}
}

//###################################################################################################

void AnimImage_blit(SDL_Surface *image, int x, int y , SDL_Surface *target)
{
	SDL_Rect rcDest = { x, y, 0, 0 };
	SDL_BlitSurface ( image, NULL, target, &rcDest );
}
