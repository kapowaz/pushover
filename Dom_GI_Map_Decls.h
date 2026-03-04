#ifndef __DOM_GI_MAP_DECLS
#define __DOM_GI_MAP_DECLS

//AND the string info stuff can go here
char author[64] = "";
char clue[128] = "";

SDL_Surface *blackScreen;
int screenFade = 255;

//stuff needed by any of the three lots of code

//GI STUFF ################################################################################
#define GI_FRAMES 280
SDL_Surface *GI[GI_FRAMES][3];

#include "classGI.h"

List<classGI> ants;
ListElement<classGI> *antEl;

classGI::classGI(int num)
{
	playerNum = num;

	GIXOffset = 0;
	GIYOffset = 0;
	GIDomino = 0;
	GIShrugNeeded = false;
	currentCostume = 0;

	GIFrame = 0;
	GIFrameChange = 0.0;

	GIHaiCount = 0;
	GIWaved = false;

	GIIterationsLeft = 0;

	openJoy();
}

#define GI_EXIT -2
#define GI_ENTER -1
#define GI_STAND 0
#define GI_WALKLEFT 1
#define GI_WALKRIGHT 2
#define GI_PICKUPLEFT 3
#define GI_PICKUPRIGHT 45
#define GI_GETUPLEFT 43
#define GI_GETUPRIGHT 44
#define GI_HOLDLEFT 4
#define GI_HOLDRIGHT 5
#define GI_CARRYLEFT 6
#define GI_CARRYRIGHT 7
#define GI_PUTDOWNLEFT 8
#define GI_PUTDOWNRIGHT 46
#define GI_MOVEBACKLEFT 9
#define GI_MOVEBACKRIGHT 32
#define GI_PUSHWAIT 10
#define GI_PUSHLEFT 11
#define GI_PUSHRIGHT 12
#define GI_PUSHSTOPLEFT 37
#define GI_PUSHSTOPRIGHT 38
#define GI_PUSHASCLEFT 39
#define GI_PUSHASCRIGHT 40
#define GI_MOVEFRONTLEFT 13
#define GI_MOVEFRONTRIGHT 33
#define GI_WOBBLELEFT 14
#define GI_WOBBLERIGHT 15
#define GI_FALL 16
#define GI_LAND 17
#define GI_PREFALLLEFT 18
#define GI_PREFALLRIGHT 19
#define GI_CLIMBUP 20
#define GI_CLIMBDOWN 21
#define GI_CLIMB 22
#define GI_DIE 23
#define GI_UPLEFT 24
#define GI_UPRIGHT 25
#define GI_DOWNLEFT 26
#define GI_DOWNRIGHT 27
#define GI_CARRYUPLEFT 28
#define GI_CARRYUPRIGHT 29
#define GI_CARRYDOWNLEFT 30
#define GI_CARRYDOWNRIGHT 31
//#define GI_MOVEBACKRIGHT 32
//#define GI_MOVEFRONTRIGHT 33
#define GI_HAI 34
#define GI_SHAKEHEAD 35
#define GI_WAVE 36
//#define GI_PUSHSTOPLEFT 37
//#define GI_PUSHSTOPRIGHT 38
//#define GI_PUSHASCRLEFT 39
//#define GI_PUSHASCRRIGHT 40
#define GI_SHRUG 41
#define GI_COVEREARS 42
//#define GI_GETUPLEFT 43
//#define GI_GETUPRIGHT 44
//#define GI_PICKUPRIGHT 45
//#define GI_PUTDOWNRIGHT 46
#define GI_FLAT 47
#define GI_CATCHWAIT 48
#define GI_CATCHPLAYER 49
#define GI_CAUGHT 50
#define GI_LEAPLEFT 51
#define GI_LEAPRIGHT 52
#define GI_LEAPCATCHLEFT 53
#define GI_LEAPCATCHRIGHT 54

#define GIF_STAND 0
#define GIF_WALK_LS 1
#define GIF_WALK_LE 4
#define GIF_WALK_RS 5
#define GIF_WALK_RE 8
	#define GI_WALKFRAMECHANGE 0.4
#define GIF_HOLD_L 9
#define GIF_CARRY_LS 10
#define GIF_CARRY_LE 14
#define GIF_HOLD_R 15
#define GIF_CARRY_RS 16
#define GIF_CARRY_RE 20
	#define GI_CARRYFRAMECHANGE 0.6
#define GIF_PICK_RS 21
#define GIF_PICK_RE 26
#define GIF_PICK_LS 179
#define GIF_PICK_LE 184
	#define GI_PICKFRAMECHANGE 0.33
#define GIF_GETUP_LS 27
#define GIF_GETUP_LE 29
#define GIF_GETUP_RS 30
#define GIF_GETUP_RE 32
	#define GI_GETUPFRAMECHANGE 1
//#define GIF_MOVEBACK_S 24
//#define GIF_MOVEBACK_E 26
//	#define GI_MOVEBACKFRAMECHANGE 0.75
//#define GIF_PUSH_LS 27
//#define GIF_PUSH_LE 29
//#define GIF_PUSH_RS 30
//#define GIF_PUSH_RE 32
//	#define GI_PUSHFRAMECHANGE 0.25
//	#define GI_PUSHPUSHPOINT_L 28
//	#define GI_PUSHPUSHPOINT_R 31
#define GIF_WOBBLE_LS 33
#define GIF_WOBBLE_LE 36
#define GIF_WOBBLE_RS 37
#define GIF_WOBBLE_RE 40
	#define GI_WOBBLEFRAMECHANGE 0.5
	#define GI_WOBBLEITERATIONS 1
#define GIF_FALL_S 41
#define GIF_FALL_E 43
	#define GI_FALLFRAMECHANGE 0.4
#define GIF_LAND_S 44
#define GIF_LAND_S2 45
#define GIF_LAND_E2 48
#define GIF_LAND_E 50
	#define GI_LANDFRAMECHANGE 0.6
	#define GI_LANDITERATIONS 1
#define GIF_PREFALL_LS 51
#define GIF_PREFALL_LS2 55
#define GIF_PREFALL_LE2 58
#define GIF_PREFALL_LE 60
#define GIF_PREFALL_RS 61
#define GIF_PREFALL_RS2 65
#define GIF_PREFALL_RE2 68
#define GIF_PREFALL_RE 70
	#define GI_PREFALLFRAMECHANGE 0.8
	#define GI_PREFALLITERATIONS 1
	#define GI_PREFALLDROPPOINT_L 53
	#define GI_PREFALLDROPPOINT_R 63
#define GIF_CLIMB_S 71
#define GIF_CLIMB_E 74
	#define GI_CLIMBFRAMECHANGE 0.4
#define GIF_EXIT_S 75
#define GIF_EXIT_E 80
	#define GI_EXITFRAMECHANGE 0.5
#define GIF_ENTER_S 81
#define GIF_ENTER_E 88
	#define GI_ENTERFRAMECHANGE 0.5
#define GIF_DIE_S 89
#define GIF_DIE_E 98
	#define GI_DIEFRAMECHANGE 0.3
#define GIF_UP_LS 99
#define GIF_UP_LE 102
#define GIF_UP_RS 103
#define GIF_UP_RE 106
	#define GI_UPFRAMECHANGE 0.5
#define GIF_DOWN_LS 107
#define GIF_DOWN_LE 109
#define GIF_DOWN_RS 110
#define GIF_DOWN_RE 112
	#define GI_DOWNFRAMECHANGE 0.5
#define GIF_CARRYSTEP_LS 113
#define GIF_CARRYSTEP_LE 115
#define GIF_CARRYSTEP_RS 116
#define GIF_CARRYSTEP_RE 118
	#define GI_CARRYSTEPFRAMECHANGE 0.5
#define GIF_MOVEBACK_LS 120//19
#define GIF_MOVEBACK_LE 122
#define GIF_MOVEBACK_RS 124//23
#define GIF_MOVEBACK_RE 126
	#define GI_MOVEBACKFRAMECHANGE 0.66
#define GIF_MOVEFRONT_LS 127
#define GIF_MOVEFRONT_LE 129//30
#define GIF_MOVEFRONT_RS 131
#define GIF_MOVEFRONT_RE 133//34
	#define GI_MOVEFRONTFRAMECHANGE 0.66
#define GIF_HAI_S 135
#define GIF_HAI_E 136
	#define GI_HAIFRAMECHANGE 0.25
	#define GI_HAIITERATIONS 6
	#define GI_HAIWAITTIME 120
#define GIF_SHAKEHEAD_S 137
#define GIF_SHAKEHEAD_E 140
	#define GI_SHAKEHEADFRAMECHANGE 0.2
	#define GI_SHAKEHEADITERATIONS 1
#define GIF_WAVE_S 141
#define GIF_WAVE_E1 142
#define GIF_WAVE_E2 143
	#define GI_WAVEFRAMECHANGE 0.25
	#define GI_WAVEITERATIONS 1
#define GIF_PUSHSTOP_LS 144
#define GIF_PUSHSTOP_LE 148
#define GIF_PUSHSTOP_RS 149
#define GIF_PUSHSTOP_RE 153
#define GIF_PUSH_LS 154
#define GIF_PUSH_LE 157
#define GIF_PUSH_RS 158
#define GIF_PUSH_RE 161
#define GIF_PUSHASC_LS 162
#define GIF_PUSHASC_LE 166
#define GIF_PUSHASC_RS 167
#define GIF_PUSHASC_RE 171
	#define GI_PUSHFRAMECHANGE 0.25
	#define GI_PUSHPUSHPOINT_L 156
	#define GI_PUSHPUSHPOINT_R 159
	#define GI_PUSHSTOPPUSHPOINT_L 146
	#define GI_PUSHSTOPPUSHPOINT_R 151
	#define GI_PUSHASCPUSHPOINT_L 163
	#define GI_PUSHASCPUSHPOINT_R 168
#define GIF_SHRUG_S 172
#define GIF_SHRUG_E 176
	#define GI_SHRUGFRAMECHANGE 0.25
#define GIF_COVEREARS_S 177
#define GIF_COVEREARS_E 178
	#define GI_COVEREARSFRAMECHANGE 0.25
//#define GIF_PICK_LS 179
//#define GIF_PICK_LE 184
#define GIF_FLAT 185
#define GIF_CATCH 186
#define GIF_HOLDPRIZE 187
#define GIF_HOLDPRIZEBLINK 188
#define GIF_CATCHWAIT_S 189
#define GIF_CATCHWAIT_E 190
	#define GI_CATCHWAITFRAMECHANGE 0.25
#define GIF_CATCHPLAYER_S 191
#define GIF_CATCHPLAYER_E 195
	#define GI_CATCHPLAYERFRAMECHANGE 0.25
#define GIF_CAUGHT_S 196
#define GIF_CAUGHT_E 200
	#define GI_CAUGHTFRAMECHANGE 0.25
#define GIF_LEAP_LS 201
#define GIF_LEAP_LE 213
#define GIF_LEAP_RS 214
#define GIF_LEAP_RE 226
	#define GI_LEAPFRAMECHANGE 0.34
#define GIF_LEAPCATCH_LS 227
#define GIF_LEAPCATCH_LE 239
#define GIF_LEAPCATCH_RS 240
#define GIF_LEAPCATCH_RE 252
	#define GI_LEAPCATCHFRAMECHANGE 0.34

#define GI_WALKSPEED 3.5
#define GI_CARRYSPEED 3.5
#define GI_CLIMBSPEED 3//2.5

#define GI_DEATHTILES 8

int GITokens = 0;
int GIOut = 0; //number of ants to get into an exit

ListElement<classGI> *renderFirst;

//MAP STUFF ###############################################################################
void loadMap(int, bool = 0, bool = 0, bool = 0);
void saveTokenState();
void restoreTokenState();

AnimImage babyDomino;

int readInt(ifstream &file);
void writeInt(ofstream &file, int number);

#define FIRSTMAP 1
#define LASTMAP lastMap[mapSet]

int lastMap[5] = { 100, 100, 18, 54, 100 };

unsigned int mapSet = 0;

#define MAPWIDTH 22 //two extra, for each side of the screen
#define MAPHEIGHT 15
#define MAPHEIGHT2 30

//map arrays
unsigned int background[MAPWIDTH][MAPHEIGHT];
unsigned int ledge[MAPWIDTH][MAPHEIGHT2];
unsigned int ladder[MAPWIDTH][MAPHEIGHT2];

int levelCompleteState; //0 = not checked yet, 1 = completed, 2 = failed
int levelState;
int doorX, doorY;
int door2X, door2Y;
float doorFrameChange;
#define LS_OPENDOOR 1
#define LS_CLOSEDOOR 2
#define LS_PLAYING 3
#define LS_OPENEXIT 4
#define LS_CLOSEEXIT 5

int currentMap;
int newMap;

SDL_Surface *miniMap;

//token stuff
bool tokenSaved;
//stuff to save:
//unsigned int tokenGIX, tokenGIY; //now part of classGI
unsigned int tokenLedge[MAPWIDTH][MAPHEIGHT2];
unsigned int tokenLadder[MAPWIDTH][MAPHEIGHT2];
unsigned int tokenDomino[MAPWIDTH][MAPHEIGHT2][2];
unsigned int tokenDomState[MAPWIDTH][MAPHEIGHT2][2];
unsigned int tokenDomFrame[MAPWIDTH][MAPHEIGHT2][2];
float tokenDomFrameChange[MAPWIDTH][MAPHEIGHT2][2];
float tokenDomX[MAPWIDTH][MAPHEIGHT2][2];
float tokenDomY[MAPWIDTH][MAPHEIGHT2][2];
int tokenDomDelay[MAPWIDTH][MAPHEIGHT2][2];
unsigned int tokenRubble[MAPWIDTH][MAPHEIGHT2];
float tokenRubbleY[MAPWIDTH][MAPHEIGHT2];
int tokenMins, tokenSecs;

//DOMINO STUFF ###########################################################################

#define DOM_TYPES 19 //number of different dominoes!
#define DOM_FPD 13 //frames per domino
#define DOM_FRAMES (DOM_TYPES * DOM_FPD) //guess

#define DOM_UPRIGHT 6
#define DOM_FRAMECHANGESPEED 0.45
#define DOM_TUMBLERFRAMECHANGESPEED 0.45//5
#define DOM_FALLSPEED 5.5
#define DOM_ASCENDSPEED 2.5
#define DOM_DELAYCOUNT 27
#define DOM_STEPDELAYCOUNT 54
#define DOM_STEPSPEEDMOD 1.8

#define D_STANDARD 1
#define D_STOPPER 2
#define D_TUMBLER 3
#define D_BRIDGER 4
#define D_VANISHER 5
#define D_TRIGGER 6
#define D_DELAY1 7
#define D_DELAY2 8
#define D_ASCENDER 9
#define D_SPLITTER1 10
#define D_SPLITTER2 11
#define D_EXPLODER 12
#define D_COUNT1 13
#define D_COUNT2 14
#define D_COUNT3 15
#define D_STARTER 16
#define D_ROCKET 17
#define D_MIMIC 18
#define D_ANTIGRAV 19

#define TILEHEIGHT 8.0 //should be 16, but it works as 8 o_O

//2 possible dominoes on each tile, hence the [2]
unsigned int domino[MAPWIDTH][MAPHEIGHT2][2];
unsigned int domState[MAPWIDTH][MAPHEIGHT2][2];
unsigned int domFrame[MAPWIDTH][MAPHEIGHT2][2];
float domFrameChange[MAPWIDTH][MAPHEIGHT2][2];
float domX[MAPWIDTH][MAPHEIGHT2][2];
float domY[MAPWIDTH][MAPHEIGHT2][2];
int domDelay[MAPWIDTH][MAPHEIGHT2][2];

unsigned int rubble[MAPWIDTH][MAPHEIGHT2];
float rubbleY[MAPWIDTH][MAPHEIGHT2];

int allowedCount;

bool starter;
int mimics;

#define STATE_STANDING 0
#define STATE_FALLLEFT 1
#define STATE_FALLRIGHT 2
#define STATE_ASCLEFT 3
#define STATE_ASCRIGHT 4
#define STATE_ASCEND 5
#define STATE_PICKUP 6
#define STATE_PUTDOWN 7

SDL_Surface *dominoes[DOM_FRAMES];
SDL_Surface *ladderDominoes[DOM_TYPES];
SDL_Surface *rubbleImg[3];

#endif