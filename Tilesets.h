#ifndef __TILESET_H
#define __TILESET_H

#define MAX_TILES 250

//stores which tileset is with each level.. used for the level select menu
int levelTileset[100] = {0};

char tilesetName[37][255] = {
	"",
	"TOXIC CITY",
	"AZTEC",
	"SPACE",
	"ELECTRO",
	"GREEK",
	"CASTLE",
	"MECHANIC",
	"DUNGEON",
	"JAPANESE",
	"LAB",
	"!AZTEC",
	"UNDERWATER",
	"!ELECTRO",
	"ICE CAVE",
	"!CASTLE",
	"MUSICAL",
	"!DUNGEON",
	"SKY TEMPLE",
	"MASTER TOXIC CITY",
	"MASTER AZTEC",
	"MASTER SPACE",
	"MASTER ELECTRO",
	"MASTER GREEK",
	"MASTER CASTLE",
	"MASTER MECHANIC",
	"MASTER DUNGEON",
	"MASTER JAPANESE",
	"MASTER LAB",
	"MASTER !AZTEC",
	"MASTER UNDERWATER",
	"MASTER !ELECTRO",
	"MASTER ICE CAVE",
	"MASTER !CASTLE",
	"MASTER MUSICAL",
	"MASTER !DUNGEON",
	"MASTER SKY TEMPLE"
};

int gameTileset;

SDL_Surface *tileset[MAX_TILES];
//SDL_Surface **tileset = (SDL_Surface**)malloc(MAX_TILES * sizeof(SDL_Surface*));

AnimImage *babyTileset = NULL;

//special sky temple backdrop
AnimImage *templeBG;
float templeBGAngle(0);
int BGPos(0);

void loadBabyTileset(int tilesetnumber, int map)
{
	if(babyTileset != NULL)
		delete babyTileset;

	babyTileset = new AnimImage;
	
	char filename[255] = "";
	sprintf(filename,"Resource\\Image\\Tileset\\Baby%i.ishi",tilesetnumber);
	babyTileset->load(filename, 8, 8, 25, 10);

	levelTileset[map - 1] = tilesetnumber;
}

void loadTileset(int tilesetnumber)
{
	int i, x, y;

	//load special backdrop
	if(templeBG != NULL)
	{
		delete templeBG;
		templeBG = NULL;
	}
	//ice cave
	if(tilesetnumber == 14 || tilesetnumber == 32)
	{
		templeBG = new AnimImage;
		templeBG->load("Resource\\Image\\Sky Temple\\Ice.ishi", 640, 480, 2, 1);
	}
	//sky temple
	if(tilesetnumber == 18 || tilesetnumber == 36)
	{
		templeBG = new AnimImage;
		templeBG->load("Resource\\Image\\Sky Temple\\1.ishi", 640, 800, 1, 1);
	}

	//create a load of blank tiles
	for(i = 0; i < MAX_TILES; i++)
	{
		SDL_FreeSurface(tileset[i]);
		tileset[i] = SDL_CreateRGBSurface(0, 32, 32, 32, 0, 0, 0, 0);
		SDL_SetColorKey(tileset[i], SDL_SRCCOLORKEY, 0xFF00FF);
	}

	//loads the tileset and draws it to the blank tiles
	char filename[255] = "";
	sprintf(filename,"Resource\\Image\\Tileset\\%i.ishi",tilesetnumber);

	SDL_Surface *temp = IMG_Load(filename);

	if(!temp)
	{
		char message[255] = "";
		sprintf(message,"Tileset %s doesn't exist.", filename);
		MessageBox(NULL, message, "Error", MB_OK);
	}

	x = 0;
	y = 0;
	for(i = 0; i < MAX_TILES; i++)
	{
		blit(temp, x * -32, y * -32, tileset[i]);
		x++;
		if(x == 25)
		{
			x = 0;
			y++;
		}
	}

	SDL_FreeSurface(temp);

	gameTileset = tilesetnumber;
}

void drawTilesetTest()
{
	//testorama
	int x(0), y(0);

	for(int i = 0; i < MAX_TILES; i++)
	{
		blit(tileset[i], x, y, screen);
		x += 32;
		y++;
		if(x >= 640)
		{
			x = 0;
			y += 32;
		}
	}
}

#endif
