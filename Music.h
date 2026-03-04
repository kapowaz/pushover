#ifndef __MUSIC_H
#define __MUSIC_H

Mix_Music *gameMusic;
int currentZone(-1);

//MODULE *gameMusicMed;

void requestMusic(int zone)
{
	if(music)
	{
		if(zone != currentZone)
		{
			//MED
			/*
			Player_Stop();
			Player_Free(gameMusicMed);
			
			char filename[255] = "";
			sprintf(filename, "Resource\\Music\\1.med", zone);
			gameMusicMed = Player_Load(filename, 128, 0);
			if(gameMusicMed)
			{
				Player_Start(gameMusicMed);
			}
			else
			{
				//sprintf(filename, "Could not load module, reason: %s\n", MikMod_strerror(MikMod_errno));
				MessageBox(NULL, "error", filename, MB_OK);
			}
			*/

			//OGG
			
			Mix_HaltMusic();
			Mix_FreeMusic(gameMusic);

			char filename[255] = "";
			sprintf(filename, "Resource\\Music\\%i.ogg", zone);
			gameMusic = Mix_LoadMUS(filename);

			Mix_PlayMusic(gameMusic, -1);
			

			currentZone = zone;
		}
	}
}

#endif