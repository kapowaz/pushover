#ifndef __SOUNDS_H
#define __SOUNDS_H

#define SOUNDS 24

//sounds array
Mix_Chunk *sounds[SOUNDS];

#define SND_OPEN_DOOR sounds[0]
#define SND_CLOSE_DOOR sounds[1]
#define SND_HAI sounds[2]
#define SND_FALL sounds[3]
#define SND_HUP sounds[4]
#define SND_LEVEL_COMPLETE sounds[5]
#define SND_DOMINO_DROP sounds[6]
#define SND_GI_SMILE sounds[7]
#define SND_LAND sounds[8]
#define SND_REBOUND sounds[9]
#define SND_TRIGGER sounds[10]
#define SND_DOMINO sounds[11]
#define SND_TRY_AGAIN sounds[12]
#define SND_BRIDGER sounds[13]
#define SND_SPLITTER sounds[14]
#define SND_EXPLODER sounds[15]
#define SND_COUNT1 sounds[16]
#define SND_COUNT2 sounds[17]
#define SND_COUNT3 sounds[18]
#define SND_BEEP1 sounds[19]
#define SND_BEEP2 sounds[20]
#define SND_VANISHER sounds[21]
#define SND_DELAY sounds[22]
#define SND_CATCH sounds[23]

int playSound(int channel, Mix_Chunk *chunk, int loops, int x)
{
	if(sound)
	{
		int c;
		Uint8 stereo = (x / 640.0) * 255;

		c = Mix_PlayChannel(channel, chunk, loops);
		Mix_SetPanning(c, 254 - stereo, stereo);

		return c;
	}
	return 0;
}

#endif