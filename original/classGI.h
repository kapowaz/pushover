#ifndef __CLASSGI_H
#define __CLASSGI_H

struct classGI {
	int playerNum;

	int GIX;
	int GIY;
	float GIXOffset;
	float GIYOffset;
	int GIDomino;
	int GILastMoved;
	int GIPushesRemain;
	bool GIShrugNeeded;

	int pickupLayer;
	
	int currentCostume;

	int GIState;

	int GIFrame;
	float GIFrameChange;
	int GIFallTiles;
	int GIFallChannel;

	int GIHaiCount;
	bool GIWaved;

	int GIIterationsLeft;

	int upKey;
	int downKey;
	int leftKey;
	int rightKey;
	int fireKey;

	bool enabled;

	//before-push save
	int tokenGIX, tokenGIY;

	//joystick handling
	SDL_Joystick *joystick;
	bool joyOn;
	//up, down, left, right, fire
	bool joyHit[5];
	bool joyDown[5];

	//functions
	classGI(int num);
	void process();
	void draw(int postLadder);
	void setControls(int num);

	//joystick functions
	void openJoy();
	void clearJoy();
	bool joyHitCheck(int cont);
	bool contHit(int cont, bool reset = true);
	bool contDown(int cont);

	ListElement<classGI> *otherGI;
};

#endif