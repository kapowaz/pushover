#ifndef __HELP_H
#define __HELP_H

AnimImage bubble;
AnimImage icons;

int helpDelay(0);
int helpAlpha(0);
int helpActive(0);
int helpIcon(0);
int helpWidth(0);
int helpX;
int helpY;
bool helpInverse(false);

char helpText[3][100];

#define ACTIVETIME 250

#define ICONQUESTION 0
#define ICONSTANDARD 1
#define ICONSTOPPER 2
#define ICONTUMBLER 3
#define ICONBRIDGER 4
#define ICONVANISHER 5
#define ICONTRIGGER 6
#define ICONDELAY 7
#define ICONASCENDER 8
#define ICONSPLITTER 9
#define ICONEXPLODER 10
#define ICONCOUNTERS 11
#define ICONEXCLAIM 12
#define ICONMULTITRIGGERS 13

void loadHelp();
void setHelp(int, int, bool = false);
void processHelp();
void renderHelp();

#define HELP_SCREENMODECHANGE 0
#define HELP_STOPPER 1
#define HELP_TUMBLER 2
#define HELP_BRIDGER 3
#define HELP_VANISHER 4
#define HELP_TRIGGER 5
#define HELP_DELAY 6
#define HELP_ASCENDER 7
#define HELP_SPLITTER 8
#define HELP_EXPLODER 9
#define HELP_COUNTERS 10
#define HELP_GENERAL1 11
#define HELP_GENERAL2 12
#define HELP_GENERAL3 13
#define HELP_GENERAL4 14
#define HELP_GENERAL5 15
#define HELP_GENERAL6 16
#define HELP_GENERAL7 17
#define HELP_GENERAL8 18
#define HELP_GENERAL9 19
#define HELP_GENERAL10 20
#define HELP_MULTITRIGGERS 21

void loadHelp()
{
	bubble.load("Resource\\Image\\Help\\Bubble.ishi", 32, 96, 4, 1);
	icons.load("Resource\\Image\\Help\\Icons.ishi", 32, 48, 20, 1);
}

void setHelp(int num, int delay, bool inverse)
{
	switch(num)
	{
	case HELP_SCREENMODECHANGE:
		helpIcon = ICONEXCLAIM;
		sprintf(helpText[0], "GRAPHICS MODE WILL TAKE");
		sprintf(helpText[1], "EFFECT THE NEXT TIME YOU");
		sprintf(helpText[2], "START PUSHOVER.");
		break;

	case HELP_GENERAL1:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "PRESS F1 AT ANY TIME");
		sprintf(helpText[1], "TO DISPLAY THE PREVIOUS");
		sprintf(helpText[2], "HELP MESSAGE AGAIN.");
		break;

	case HELP_GENERAL2:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "SOUND AND GRAPHICS");
		sprintf(helpText[1], "OPTIONS CAN BE CHANGED");
		sprintf(helpText[2], "FROM THE MAIN MENU.");
		break;

	case HELP_GENERAL3:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "STUCK ON A PUZZLE? WAIT FOR THE");
		sprintf(helpText[1], "LEVEL TIME TO RUN OUT AND A CLUE");
		sprintf(helpText[2], "WILL BE SHOWN ON THE PAUSE MENU.");
		break;

	case HELP_GENERAL4:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "ON THE LEVEL SELECT SCREEN YOU");
		sprintf(helpText[1], "CAN USE THE 1-0 KEYS TO SKIP");
		sprintf(helpText[2], "QUICKLY TO LEVELS 10-100.");
		break;

	case HELP_GENERAL5:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "PERSEVERE THROUGH THE PUZZLES");
		sprintf(helpText[1], "AND THERE COULD BE SOME");
		sprintf(helpText[2], "POINTLESS BUT FUN REWARDS!");
		break;

	case HELP_GENERAL6:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "EVEN IF YOU COMPLETE A PUZZLE,");
		sprintf(helpText[1], "YOU WILL STILL FAIL IF G.I.ANT");
		sprintf(helpText[2], "CAN'T REACH THE EXIT IN TIME.");
		break;

	case HELP_GENERAL7:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "THERE IS MORE THAN");
		sprintf(helpText[1], "ONE WAY TO START A");
		sprintf(helpText[2], "CHAIN OF DOMINOES.");
		break;

	case HELP_GENERAL8:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "USE THE EDITOR TO MAKE YOUR OWN");
		sprintf(helpText[1], "LEVELS AND THEY COULD BE INCLUDED");
		sprintf(helpText[2], "IN THE NEXT VERSION OF THE GAME!");
		break;

	case HELP_GENERAL9:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "SOME PUZZLES CAN BE MADE A");
		sprintf(helpText[1], "LOT SIMPLER IF YOU FIND AN");
		sprintf(helpText[2], "ALTERNATIVE SOLUTION.");
		break;

	case HELP_GENERAL10:
		helpIcon = ICONQUESTION;
		sprintf(helpText[0], "THIS IS THE LAST HELP MESSAGE FOR NOW.");
		sprintf(helpText[1], "");
		sprintf(helpText[2], "          ENJOY PLAYING!!");
		break;

	case HELP_STOPPER:
		helpIcon = ICONSTOPPER;
		sprintf(helpText[0], "STOPPERS CAN BE PICKED UP AND");
		sprintf(helpText[1], "MOVED, BUT CAN'T BE KNOCKED OVER.");
		sprintf(helpText[2], "THEY DO NOT NEED TO BE TOPPLED.");
		break;

	case HELP_TUMBLER:
		helpIcon = ICONTUMBLER;
		sprintf(helpText[0], "TUMBLERS WILL ROLL ALONG LEDGES");
		sprintf(helpText[1], "UNTIL STOPPED OR REBOUNDED BY");
		sprintf(helpText[2], "ANOTHER DOMINO.");
		break;

	case HELP_BRIDGER:
		helpIcon = ICONBRIDGER;
		sprintf(helpText[0], "KNOCK A BRIDGER INTO A GAP");
		sprintf(helpText[1], "TO FILL IT IN AND ALLOW");
		sprintf(helpText[2], "G.I.ANT TO WALK ACROSS.");
		break;

	case HELP_VANISHER:
		helpIcon = ICONVANISHER;
		sprintf(helpText[0], "VANISHERS DISAPPEAR WHEN THEY ARE");
		sprintf(helpText[1], "KNOCKED OVER. UNLIKE OTHER BLOCKS,");
		sprintf(helpText[2], "VANISHERS CAN BE PLACED IN FRONT OF DOORS.");
		break;

	case HELP_TRIGGER:
		helpIcon = ICONTRIGGER;
		sprintf(helpText[0], "THE AIM OF THE GAME IS TO KNOCK");
		sprintf(helpText[1], "ALL OF THE DOMINOES OVER. THE");
		sprintf(helpText[2], "TRIGGER MUST BE LAST TO FALL.");
		break;

	case HELP_DELAY:
		helpIcon = ICONDELAY;
		sprintf(helpText[0], "DELAYS PAUSE FOR A SHORT TIME BEFORE");
		sprintf(helpText[1], "FALLING OVER. IN THIS TIME THEY WILL");
		sprintf(helpText[2], "REBOUND OTHER BLOCKS LIKE STOPPERS DO.");
		break;

	case HELP_ASCENDER:
		helpIcon = ICONASCENDER;
		sprintf(helpText[0], "WHEN HIT, ASCENDERS");
		sprintf(helpText[1], "DEFY GRAVITY AND");
		sprintf(helpText[2], "FALL UPWARDS.");
		break;

	case HELP_SPLITTER:
		helpIcon = ICONSPLITTER;
		sprintf(helpText[0], "DROP A BLOCK ONTO THE TOP OF A");
		sprintf(helpText[1], "SPLITTER AND IT DIVIDES IN TWO, ");
		sprintf(helpText[2], "KNOCKING OVER THE BLOCKS TO EITHER SIDE.");
		break;

	case HELP_EXPLODER:
		helpIcon = ICONEXPLODER;
		sprintf(helpText[0], "WHEN HIT, AN EXPLODER WILL");
		sprintf(helpText[1], "LEAVE A GAP IN THE FLOOR");
		sprintf(helpText[2], "WHERE IT WAS STANDING.");
		break;

	case HELP_COUNTERS:
		helpIcon = ICONCOUNTERS;
		sprintf(helpText[0], "COUNTER-STOPPERS CAN ONLY BE");
		sprintf(helpText[1], "KNOCKED OVER IN THE ORDER SHOWN");
		sprintf(helpText[2], "BY THE NUMBER OF YELLOW STRIPES.");
		break;

	case HELP_MULTITRIGGERS:
		helpIcon = ICONMULTITRIGGERS;
		sprintf(helpText[0], "WHEN THERE IS MORE THAN ONE TRIGGER");
		sprintf(helpText[1], "IN A LEVEL, THEY MUST ALL BE");
		sprintf(helpText[2], "KNOCKED OVER AT THE SAME TIME.");
		break;

	}

	int biggestLength(0), i;
	for(i = 0; i < 3; i++)
	{
		if(strlen(helpText[i]) > biggestLength)
			biggestLength = strlen(helpText[i]);
	}

	helpDelay = delay;
	helpWidth = (biggestLength * 12 + 96) / 32;
	helpX = 632 - helpWidth * 32;
	helpActive = ACTIVETIME;
	helpAlpha = 0;

	helpInverse = inverse;
	if(helpInverse)
	{
		helpY = 368;
	}
	else
	{
		helpY = 0;
	}
}

void processHelp()
{
	if(helpDelay)
	{
		helpDelay--;
	}
	else
	{
		if(helpWidth)
		{
			if(helpActive)
			{
				//fade in
				helpAlpha += 50;
				if(helpAlpha > 192)
					helpAlpha = 192;

				//count down the time
				helpActive--;

				//turn off
				if(KeyHit(SDLK_F1))
				{
					helpActive = 0;
				}
			}
			else
			{
				//fade out
				helpAlpha -= 30;
				if(helpAlpha < 0)
					helpAlpha = 0;

				//turn on again
				if(KeyHit(SDLK_F1))
				{
					helpActive = ACTIVETIME;
				}
			}
		}
	}
}

void renderHelp()
{
	if(helpWidth)
	{
		if(helpAlpha)
		{
			int i;

			//bubble
			blitalpha(bubble.frame(0), helpX, helpY, screen, helpAlpha);
			for(i = 1; i < helpWidth - 1; i++)
			{
				blitalpha(bubble.frame(1), helpX + i * 32, helpY, screen, helpAlpha);
			}
			if(helpInverse)
			{
				blitalpha(bubble.frame(3), helpX + (helpWidth - 1) * 32, helpY + 16, screen, helpAlpha);
			}
			else
			{
				blitalpha(bubble.frame(2), helpX + (helpWidth - 1) * 32, helpY, screen, helpAlpha);
			}
			
			//icon
			blitalpha(icons.frame(helpIcon), helpX + 16, helpY + 32, screen, helpAlpha);
			//text
			for(i = 0; i < 3; i++)
			{
				drawText(helpX + 64, helpY + 32 + (i * 16), helpText[i], 1, 0, helpAlpha);
			}
		}
	}
}

#endif