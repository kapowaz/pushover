#ifndef __JOYSTICK_H
#define __JOYSTICK_H

#define CONTUP 0
#define CONTDOWN 1
#define CONTLEFT 2
#define CONTRIGHT 3
#define CONTFIRE 4

//now part of classGI
/*
SDL_Joystick *joystick;

bool joyOn;

//up, down, left, right, fire
bool joyHit[5];
bool joyDown[5];
*/

void classGI::openJoy()
{
	SDL_JoystickEventState(SDL_ENABLE);
	joystick = SDL_JoystickOpen(playerNum);

	if(joystick == NULL)
		joyOn = false;
	else
		joyOn = true;

	//joyOn = false;

	for(int i = 0; i < 5; i++)
	{
		joyDown[i] = false;
		joyHit[i] = false;
	}
}

void classGI::clearJoy()
{
	for(int i = 0; i < 5; i++)
	{
		joyHit[i] = false;
	}
	//MessageBox(NULL, "a", "a", MB_OK);
}

bool classGI::joyHitCheck(int cont)
{
	if(joyHit[cont])
	{
		joyHit[cont] = false;
		return true;
	}
	return false;
}

bool classGI::contHit(int cont, bool reset)
{
	if(playing)
		return contHitVideo(cont);

	if(!(joyHitCheck(cont) && joyOn))
	{
		switch(cont)
		{
		case 0:
			return KeyHit(upKey, reset);
		case 1:
			return KeyHit(downKey, reset);
		case 2:
			return KeyHit(leftKey, reset);
		case 3:
			return KeyHit(rightKey, reset);
		case 4:
			return KeyHit(fireKey, reset);
		default:
			return 0;
		}
	}
	else
		return 1;
}

bool classGI::contDown(int cont)
{
	if(playing)
		return contDownVideo(cont);

	if(!(joyDown[cont] && joyOn))
	{
		switch(cont)
		{
		case 0:
			return KeyDown(upKey);
		case 1:
			return KeyDown(downKey);
		case 2:
			return KeyDown(leftKey);
		case 3:
			return KeyDown(rightKey);
		case 4:
			return KeyDown(fireKey);
		default:
			return 0;
		}
	}
	else
		return 1;
}

#endif