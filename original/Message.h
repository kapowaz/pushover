#ifndef __MESSAGE_H
#define __MESSAGE_H

#define MSG_TOKENGAIN 1
#define MSG_TOOSLOW 2
#define MSG_NOTALLTOPPLED 3
#define MSG_STILLHOLDING 4
#define MSG_CRASHED 5
#define MSG_DIED 6
#define MSG_PAUSE 7
#define MSG_PRIZE 8
#define MSG_COSTUMEUNLOCK 9

int messageDelay;
int messageDelayStyle;

int messageStyle = 0;

#define MESSAGEDELAY 50

const char LETTERS[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!r',?:-";
#define NUM_LETTERS 44

int messageX, messageY, messageW, messageH;

char messageText[9][255];
int messageTextY[9];

int optionsStart;
int optionsSelect;

//number images
SDL_Surface *border[13];
SDL_Surface *letters[NUM_LETTERS][3];

int messageBox(int style, int variation = 0);

void loadMessageImages()
{
	int i, i2;

	//border
	//create a load of blank tiles
	for(i = 0; i < 13; i++)
	{
		border[i] = SDL_CreateRGBSurface(0, 32, 32, 32, 0, 0, 0, 0);
		SDL_SetColorKey(border[i], SDL_SRCCOLORKEY, 0xFF00FF);
	}

	//load and draw to the blank tiles
	SDL_Surface *temp = IMG_Load("Resource\\Image\\Border.ishi");

	for(i = 0; i < 13; i++)
	{
		blit(temp, i * -32, 0, border[i]);
	}

	SDL_FreeSurface(temp);

	//letters
	//create a load of blank tiles
	for(i = 0; i < NUM_LETTERS; i++)
	{
		for(i2 = 0; i2 < 3; i2++)
		{
			letters[i][i2] = SDL_CreateRGBSurface(0, 12, 14, 32, 0, 0, 0, 0);
			SDL_SetColorKey(letters[i][i2], SDL_SRCCOLORKEY, 0xFF00FF);
		}
	}

	//load and draw to the blank tiles
	temp = IMG_Load("Resource\\Image\\Letter.ishi");

	for(i = 0; i < NUM_LETTERS; i++)
	{
		for(i2 = 0; i2 < 3; i2++)
		{
			blit(temp, i * -12, i2 * -14, letters[i][i2]);
		}
	}

	SDL_FreeSurface(temp);
}

void setMessageSize(int w,int h)
{
	messageW = w;
	messageH = h;
	messageX = 320 - w * 16;
	messageY = 200 - h * 16;
}

void drawMessage()
{
	int x,y,f,i;

	for(x = 0; x < messageW; x++)
	{
		for(y = 0; y < messageH; y++)
		{
			//centre
			f = 12;

			//edges
			if(y == 0)
				f = 8;
			if(y == messageH - 1)
				f = 9;
			if(x == messageW - 1)
				f = 10;
			if(x == 0)
				f = 11;

			//next-to-corner bits
			if(x == 1 && y == 0)
				f = 4;
			if(x == messageW - 2 && y == messageH - 1)
				f = 5;
			if(x == messageW - 1 && y == 1)
				f = 6;
			if(x == 0 && y == messageH - 2)
				f = 7;

			//corners
			if(x == 0 && y == 0)
				f = 0;
			if(x == 0 && y == messageH - 1)
				f = 1;
			if(x == messageW - 1 && y == 0)
				f = 3;
			if(x == messageW - 1 && y == messageH - 1)
				f = 2;

			blit(border[f], messageX + x * 32, messageY + y * 32, screen);
		}
	}

	//text
	for(i = 0; i < 9; i++)
	{
		f = 0;
		if(i >= optionsStart && optionsStart > 0)
		{
			f = 1;
			if(i == optionsSelect)
				f = 2;
		}

		drawText(320, messageY + messageTextY[i] + 32, messageText[i], f, 1);
	}

	//pause menu - block types
	if(messageStyle == MSG_PAUSE)
	{
		blit(dominoes[DOM_UPRIGHT + (D_STANDARD * DOM_FPD) - DOM_FPD], messageX + 12, messageY + 140, screen);
			drawText(messageX + 62, messageY + 153, "STANDARD", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_STOPPER * DOM_FPD) - DOM_FPD], messageX + 12, messageY + 204, screen);
			drawText(messageX + 62, messageY + 217, "STOPPER", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_VANISHER * DOM_FPD) - DOM_FPD], messageX + 12, messageY + 268, screen);
			drawText(messageX + 62, messageY + 281, "VANISHER", 0, 0);

		blit(dominoes[DOM_UPRIGHT + (D_TUMBLER * DOM_FPD) - DOM_FPD], messageX + 200, messageY + 172, screen);
			drawText(messageX + 130, messageY + 185, "TUMBLER", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_BRIDGER * DOM_FPD) - DOM_FPD], messageX + 200, messageY + 236, screen);
			drawText(messageX + 130, messageY + 249, "BRIDGER", 0, 0);

		blit(dominoes[DOM_UPRIGHT + (D_ASCENDER * DOM_FPD) - DOM_FPD], messageX + 300, messageY + 172, screen);
			drawText(messageX + 350, messageY + 185, "ASCENDER", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_DELAY2 * DOM_FPD) - DOM_FPD], messageX + 300, messageY + 236, screen);
			drawText(messageX + 350, messageY + 249, "DELAY", 0, 0);

		blit(dominoes[DOM_UPRIGHT + (D_EXPLODER * DOM_FPD) - DOM_FPD], messageX + 490, messageY + 140, screen);
			drawText(messageX + 410, messageY + 153, "EXPLODER", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_SPLITTER1 * DOM_FPD) - DOM_FPD], messageX + 490, messageY + 204, screen);
			drawText(messageX + 410, messageY + 217, "SPLITTER", 0, 0);
		blit(dominoes[DOM_UPRIGHT + (D_TRIGGER * DOM_FPD) - DOM_FPD], messageX + 490, messageY + 268, screen);
			drawText(messageX + 420, messageY + 281, "TRIGGER", 0, 0);

		char auth[255] = "";
		sprintf(auth, "AUTHOR: %s",author);
		drawText(321, 461, auth, 1, 1);
		drawText(320, 460, auth, 0, 1);
	}
}

void drawText(int x, int y, const char *str, int colour, bool centre, int alpha)
{
	if(centre)
	{
		x -= strlen(str) * 6;
	}

	int i, i2;
	for(i = 0; i < strlen(str); i++)
	{
		for(i2 = 0; i2 < strlen(LETTERS); i2++)
		{
			if(str[i] == LETTERS[i2])
			{
				blitalpha(letters[i2][colour], x + i * 12, y, screen, alpha);
			}
		}
	}
}

int messageBox(int style, int variation)
{
	endVideoPlay();

	messageStyle = style;

	//setup messagebox
	switch(style)
	{
	case MSG_TOKENGAIN:
		setMessageSize(13, 4);
		sprintf(messageText[0],"CONGRATULATIONS"); messageTextY[0] = 0;
		sprintf(messageText[1],"YOU COMPLETED THE PUZZLE"); messageTextY[1] = 32;
		sprintf(messageText[2],"YOU GAIN A TOKEN"); messageTextY[2] = 48;
		sprintf(messageText[3],""); messageTextY[3] = 64;
		sprintf(messageText[4],""); messageTextY[4] = 80;
		sprintf(messageText[5],""); messageTextY[5] = 96;
		sprintf(messageText[6],""); messageTextY[6] = 120;
		sprintf(messageText[7],""); messageTextY[7] = 144;
		sprintf(messageText[8],""); messageTextY[8] = 168;
		optionsStart = 0;
		optionsSelect = 0;
		break;

	case MSG_PRIZE:
		setMessageSize(15, 4);
		sprintf(messageText[0],"YOU FOUND A BAG OF MEGA TATERS!"); messageTextY[0] = 8;
		switch(mapSet)
		{
		case MS_ORIGINAL:
			switch(variation)
			{
			case 0:
				sprintf(messageText[1],"THEY'RE WELL TASTY!"); messageTextY[1] = 40;
				break;
			case 1:
				sprintf(messageText[1],"CAN YOU BELIEVE IT?"); messageTextY[1] = 40;
				break;
			case 2:
				sprintf(messageText[1],"THREE CHEERS FOR SNACK FOOD!"); messageTextY[1] = 40;
				break;
			case 3:
				sprintf(messageText[1],"MADE IN A PARALLEL DIMENSION!"); messageTextY[1] = 40;
				break;
			case 4:
				sprintf(messageText[1],"THEY'RE NOT CURLY."); messageTextY[1] = 40;
				break;
			case 5:
				sprintf(messageText[1],"THEY'RE BETTER THAN CHUCK NORRIS."); messageTextY[1] = 40;
				break;
			case 6:
				sprintf(messageText[1],"THEY'RE MADE FROM POTATOES!"); messageTextY[1] = 40;
				break;
			case 7:
				sprintf(messageText[1],"SHAME THEY'RE ALL THE SAME FLAVOUR."); messageTextY[1] = 40;
				break;
			case 8:
				sprintf(messageText[1],"DID YOU EXPECT ANYTHING ELSE?"); messageTextY[1] = 40;
				break;
			case 9:
				sprintf(messageText[1],"THEY'RE SO GOOD IT HURTS!"); messageTextY[1] = 40;
				break;
			default:
				sprintf(messageText[1],""); messageTextY[1] = 40;
				break;
			}
			break;
		
		case MS_NEW:
			switch(variation)
			{
			case 0:
				sprintf(messageText[1],"THE PACKET COLOUR CHANGED!"); messageTextY[1] = 40;
				break;
			case 1:
				sprintf(messageText[1],"THEY'RE A DELICACY IN MANY COUNTRIES!"); messageTextY[1] = 40;
				break;
			case 2:
				sprintf(messageText[1],"SHOULD KEEP G.I. FED FOR A BIT."); messageTextY[1] = 40;
				break;
			case 3:
				sprintf(messageText[1],"CONTAINS 6 E NUMBERS!"); messageTextY[1] = 40;
				break;
			case 4:
				sprintf(messageText[1],"KEEP UP THE GOOD WORK!"); messageTextY[1] = 40;
				break;
			case 5:
				sprintf(messageText[1],"PO-TA-TOES! BOIL 'EM, MASH 'EM, ETC!"); messageTextY[1] = 40;
				break;
			case 6:
				sprintf(messageText[1],"FOIL PACKED FOR FRESHNESS!"); messageTextY[1] = 40;
				break;
			case 7:
				sprintf(messageText[1],"ALL THAT SALT CAN'T BE GOOD FOR YOU!"); messageTextY[1] = 40;
				break;
			case 8:
				sprintf(messageText[1],"THEY NEED A MASCOT. A DOG IN A SUIT!"); messageTextY[1] = 40;
				break;
			case 9:
				sprintf(messageText[1],"MOST DEFINITELY NOT FLOATY LIGHT."); messageTextY[1] = 40;
				break;
			default:
				sprintf(messageText[1],""); messageTextY[1] = 40;
				break;
			}
			break;
		}

		sprintf(messageText[2],""); messageTextY[2] = 48;
		sprintf(messageText[3],""); messageTextY[3] = 64;
		sprintf(messageText[4],""); messageTextY[4] = 80;
		sprintf(messageText[5],""); messageTextY[5] = 96;
		sprintf(messageText[6],""); messageTextY[6] = 120;
		sprintf(messageText[7],""); messageTextY[7] = 144;
		sprintf(messageText[8],""); messageTextY[8] = 168;
		optionsStart = 0;
		optionsSelect = 0;
		break;

	case MSG_TOOSLOW:
		setMessageSize(13, 8);
		sprintf(messageText[0],"YOU COMPLETED THE PUZZLE"); messageTextY[0] = 0;
		sprintf(messageText[1],"HOWEVER YOU DID NOT DO IT"); messageTextY[1] = 16;
		sprintf(messageText[2],"FAST ENOUGH!"); messageTextY[2] = 32;
		
		if(GITokens)
		{
			sprintf(messageText[3],"YOU HAVE %i TOKENS LEFT.", GITokens); messageTextY[3] = 64;
			sprintf(messageText[4],"YOU CAN USE A TOKEN TO"); messageTextY[4] = 80;
			sprintf(messageText[5],"GO TO NEXT LEVEL"); messageTextY[5] = 96;
			sprintf(messageText[6],"USE TOKEN"); messageTextY[6] = 120;
			optionsStart = 6;
		}
		else
		{
			sprintf(messageText[3],""); messageTextY[3] = 64;
			sprintf(messageText[4],""); messageTextY[4] = 80;
			sprintf(messageText[5],""); messageTextY[5] = 96;
			sprintf(messageText[6],""); messageTextY[6] = 120;
			optionsStart = 7;
		}

		sprintf(messageText[7],"REPLAY PUZZLE"); messageTextY[7] = 144;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 168;

		optionsSelect = 7;
		break;

	case MSG_NOTALLTOPPLED:
		setMessageSize(13, 8);
		sprintf(messageText[0],"YOU FAILED"); messageTextY[0] = 0;
		sprintf(messageText[1],"NOT ALL DOMINOES HAVE"); messageTextY[1] = 16;
		sprintf(messageText[2],"TOPPLED"); messageTextY[2] = 32;
		
		if(tokenSaved == true && GITokens)
		{
			sprintf(messageText[3],"YOU HAVE %i TOKENS LEFT.", GITokens); messageTextY[3] = 64;
			sprintf(messageText[4],"YOU CAN USE A TOKEN TO"); messageTextY[4] = 80;
			sprintf(messageText[5],"RESET TO BEFORE THE PUSH"); messageTextY[5] = 96;
			sprintf(messageText[6],"USE TOKEN"); messageTextY[6] = 120;
			optionsStart = 6;
		}
		else
		{
			sprintf(messageText[3],""); messageTextY[3] = 64;
			sprintf(messageText[4],""); messageTextY[4] = 80;
			sprintf(messageText[5],""); messageTextY[5] = 96;
			sprintf(messageText[6],""); messageTextY[6] = 120;
			optionsStart = 7;
		}

		sprintf(messageText[7],"REPLAY PUZZLE"); messageTextY[7] = 144;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 168;

		optionsSelect = 7;
		break;

	case MSG_STILLHOLDING:
		setMessageSize(13, 8);
		sprintf(messageText[0],"YOU FAILED"); messageTextY[0] = 0;
		sprintf(messageText[1],"YOU ARE STILL HOLDING"); messageTextY[1] = 16;
		sprintf(messageText[2],"A DOMINO"); messageTextY[2] = 32;
		
		if(tokenSaved == true && GITokens)
		{
			sprintf(messageText[3],"YOU HAVE %i TOKENS LEFT.", GITokens); messageTextY[3] = 64;
			sprintf(messageText[4],"YOU CAN USE A TOKEN TO"); messageTextY[4] = 80;
			sprintf(messageText[5],"RESET TO BEFORE THE PUSH"); messageTextY[5] = 96;
			sprintf(messageText[6],"USE TOKEN"); messageTextY[6] = 120;
			optionsStart = 6;
		}
		else
		{
			sprintf(messageText[3],""); messageTextY[3] = 64;
			sprintf(messageText[4],""); messageTextY[4] = 80;
			sprintf(messageText[5],""); messageTextY[5] = 96;
			sprintf(messageText[6],""); messageTextY[6] = 120;
			optionsStart = 7;
		}

		sprintf(messageText[7],"REPLAY PUZZLE"); messageTextY[7] = 144;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 168;

		optionsSelect = 7;
		break;

	case MSG_CRASHED:
		setMessageSize(13, 8);
		sprintf(messageText[0],"YOU FAILED"); messageTextY[0] = 0;
		sprintf(messageText[1],"SOME DOMINOES HAVE"); messageTextY[1] = 16;
		sprintf(messageText[2],"CRASHED"); messageTextY[2] = 32;
		
		if(tokenSaved == true && GITokens)
		{
			sprintf(messageText[3],"YOU HAVE %i TOKENS LEFT.", GITokens); messageTextY[3] = 64;
			sprintf(messageText[4],"YOU CAN USE A TOKEN TO"); messageTextY[4] = 80;
			sprintf(messageText[5],"RESET TO BEFORE THE PUSH"); messageTextY[5] = 96;
			sprintf(messageText[6],"USE TOKEN"); messageTextY[6] = 120;
			optionsStart = 6;
		}
		else
		{
			sprintf(messageText[3],""); messageTextY[3] = 64;
			sprintf(messageText[4],""); messageTextY[4] = 80;
			sprintf(messageText[5],""); messageTextY[5] = 96;
			sprintf(messageText[6],""); messageTextY[6] = 120;
			optionsStart = 7;
		}

		sprintf(messageText[7],"REPLAY PUZZLE"); messageTextY[7] = 144;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 168;

		optionsSelect = 7;
		break;

	case MSG_DIED:
		setMessageSize(13, 8);
		sprintf(messageText[0],"YOU FAILED"); messageTextY[0] = 0;
		sprintf(messageText[1],""); messageTextY[1] = 16;
		sprintf(messageText[2],"YOU DIED"); messageTextY[2] = 32;
		sprintf(messageText[3],""); messageTextY[3] = 64;
		sprintf(messageText[4],""); messageTextY[4] = 80;
		sprintf(messageText[5],""); messageTextY[5] = 96;
		sprintf(messageText[6],""); messageTextY[6] = 120;
		sprintf(messageText[7],"REPLAY PUZZLE"); messageTextY[7] = 144;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 168;
		optionsStart = 7;
		optionsSelect = 7;
		break;

	case MSG_PAUSE:
		setMessageSize(18, 12);
		sprintf(messageText[0],"PAUSED"); messageTextY[0] = 0;
		sprintf(messageText[1],""); messageTextY[1] = 32;
		sprintf(messageText[2],""); messageTextY[2] = 56;
		sprintf(messageText[3],""); messageTextY[3] = 64;

		if(negative) //real clue!
		{
			char clue1[40];
			char clue2[40];
			int i, i2;

			//copy first half of clue to clue1.
			for(i = 0; i < 39; i++)
			{
				if(i < strlen(clue))
				{
					clue1[i] = clue[i];
				}
			}
			
			//roll marker back until reaches a space
			if(strlen(clue) >= 40)
			{
				while(clue1[i] != ' ')
				{
					i--;
				}
			}

			clue1[i] = 0;

			//copy the rest into clue2
			for(i2 = i; i2 < 64; i2++)
			{
				if(i2 < strlen(clue))
				{
					clue2[i2 - i] = clue[i2];
				}
			}

			sprintf(messageText[4],"%s",clue1); messageTextY[4] = 50;
			sprintf(messageText[5],"%s",clue2); messageTextY[5] = 66;
		}
		else
		{
			sprintf(messageText[4],"ARRANGE THE DOMINOES SO THAT YOU CAN TOPPLE"); messageTextY[4] = 50;
			sprintf(messageText[5],"THEM ALL OVER. THE TRIGGER MUST FALL LAST."); messageTextY[5] = 66;
		}
		
		sprintf(messageText[6],"CONTINUE"); messageTextY[6] = 252;
		sprintf(messageText[7],"RETRY"); messageTextY[7] = 276;
		sprintf(messageText[8],"QUIT"); messageTextY[8] = 300;
		optionsStart = 6;
		optionsSelect = 6;
		break;

	case MSG_COSTUMEUNLOCK:
		setMessageSize(18, 8);
		sprintf(messageText[0],"CONGRATULATIONS!!"); messageTextY[0] = 0;
		sprintf(messageText[1],""); messageTextY[1] = 16;
		sprintf(messageText[2],"YOU HAVE UNLOCKED A NEW"); messageTextY[2] = 32;
		sprintf(messageText[3],"PLAYABLE CHARACTER!"); messageTextY[3] = 64;
		sprintf(messageText[4],""); messageTextY[4] = 80;
		sprintf(messageText[5],""); messageTextY[5] = 96;
		sprintf(messageText[6],"YOU CAN SELECT HIM IN THE PROFILE OPTIONS"); messageTextY[6] = 120;
		sprintf(messageText[7],"SCREEN, ACCESSIBLE BY GOING LEFT FROM THE"); messageTextY[7] = 144;
		sprintf(messageText[8],"ORIGINAL LEVEL SELECT SCREEN."); messageTextY[8] = 168;
		optionsStart = 0;
		optionsSelect = 0;
		break;

	default:
		setMessageSize(13, 8);
		sprintf(messageText[0],""); messageTextY[0] = 0;
		sprintf(messageText[1],""); messageTextY[1] = 16;
		sprintf(messageText[2],""); messageTextY[2] = 32;
		sprintf(messageText[3],""); messageTextY[3] = 64;
		sprintf(messageText[4],""); messageTextY[4] = 80;
		sprintf(messageText[5],""); messageTextY[5] = 96;
		sprintf(messageText[6],""); messageTextY[6] = 120;
		sprintf(messageText[7],""); messageTextY[7] = 144;
		sprintf(messageText[8],""); messageTextY[8] = 168;
		optionsStart = 0;
		optionsSelect = 0;
		break;
	}

	//SDL_Delay(500);

	while(!ants.first->data->contHit(CONTFIRE))
	{
		//do events and check sdl_quit
		if(!DoEvents() || KeyHit(SDLK_ESCAPE))
		{
			fadeOut();
			exit(0);
		}

		//message processing goes here
		if(ants.first->data->contHit(CONTUP))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			if(optionsSelect > optionsStart)
				optionsSelect--;
		}
		else if(ants.first->data->contHit(CONTDOWN))
		{
			playSound(-1, SND_BEEP1, 0, 320);
			if(optionsSelect < 8)
				optionsSelect++;
		}
		
		if(messageStyle == MSG_PAUSE)
		{
			if(KeyHit(SDLK_p))
			{
				optionsSelect = 6;
				break;
			}
		}
		
		processHelp();
		if(style != MSG_PRIZE && style != MSG_COSTUMEUNLOCK)
		{
			Render(1);
		}
		else
		{
			Render(2);
		}
		Timer();
	}

	playSound(-1, SND_BEEP2, 0, 320);
	
	ants.first->data->joyDown[CONTFIRE] = false;
	ants.last->data->joyDown[CONTFIRE] = false;
	sdl_key[SDLK_z] = 0;
	prevTicks = GetTickCount();
	return optionsSelect;
}

#endif