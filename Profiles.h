#ifndef __PROFILES_H
#define __PROFILES_H

class Profile {
public:
	char name[9];
	bool helpDisplayed[11];
	int tokens;
	int levelsComplete[5];
	bool prizeGot[10][2];
	int costume;
	int costumesUnlocked;

	Profile(char*);
};

Profile::Profile(char * _name)
{
	int i;

	strcpy(name, _name);
	for(i = 0; i < 11; i++)
	{
		helpDisplayed[i] = false;
	}
	tokens = 0;
	levelsComplete[MS_ORIGINAL] = 1;
	levelsComplete[MS_NEW] = 0;
	levelsComplete[MS_MASTER] = 0;
	levelsComplete[MS_COOP] = 0;
	levelsComplete[MS_CUSTOM] = 101;

	for(i = 0; i < 10; i++)
	{
		prizeGot[i][0] = false;
		prizeGot[i][1] = false;
	}

	costume = 0;
	costumesUnlocked = 1;
}

List<Profile> profiles;
ListElement<Profile> *profilesIt;
ListElement<Profile> *activeProfile;

void saveProfiles()
{
	int i;

	ofstream file;
	file.open("Data\\Profiles\\Profiles.dat");
	if(file.fail()) return;

	//version
	writeInt(file, 8);

	//count profiles
	i = 0;
	for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
	{
		i++;
	}
	writeInt(file, i);

	//write each profile
	for(profilesIt=profiles.first;profilesIt!=NULL;NE(profilesIt))
	{
		//name
		for(i = 0; i < 9; i++)
		{
			writeInt(file, profilesIt->data->name[i]);
		}
		//tokens
		writeInt(file, profilesIt->data->tokens);
		//levels complete
		for(i = 0; i < 4; i++)
		{
			writeInt(file, profilesIt->data->levelsComplete[i]);
		}
		//help
		for(i = 0; i < 11; i++)
		{
			writeInt(file, static_cast<int>(profilesIt->data->helpDisplayed[i]));
		}

		//prizes
		for(i = 0; i < 10; i++)
		{
			writeInt(file, static_cast<int>(profilesIt->data->prizeGot[i][0]));
			writeInt(file, static_cast<int>(profilesIt->data->prizeGot[i][1]));
		}
		//costume last used
		writeInt(file, profilesIt->data->costume);
		//costumes unlocked
		writeInt(file, profilesIt->data->costumesUnlocked);
	}

	file.close();
}


void loadProfiles()
{
	int i;
	int count;
	int version;

	ifstream file;
	file.open("Data\\Profiles\\Profiles.dat");
	if(file.fail()) return;

	//delete all old profiles
	while(profiles.last)
		profiles.del(profiles.last);

	//version
	version = readInt(file);

	//profile count
	count = readInt(file);

	//read each profile
	for(; count > 0; count--)
	{
		profiles.addback(new Profile(""));
		profilesIt = profiles.last;
		//name
		for(i = 0; i < 9; i++)
		{
			profilesIt->data->name[i] = readInt(file);
		}
		profilesIt->data->tokens = readInt(file);

		if(version <= 1)
		{
			profilesIt->data->levelsComplete[0] = readInt(file);
		}
		else
		{
			if(version <= 7)
			{
				profilesIt->data->levelsComplete[MS_ORIGINAL] = readInt(file);

				profilesIt->data->levelsComplete[MS_NEW] = readInt(file);
				profilesIt->data->levelsComplete[MS_NEW] = 1;

				profilesIt->data->levelsComplete[MS_MASTER] = 0;

				profilesIt->data->levelsComplete[MS_CUSTOM] = readInt(file);
			}
			else
			{
				for(i = 0; i < 4; i++)
				{
					profilesIt->data->levelsComplete[i] = readInt(file);
				}
			}
		}

		if(version >= 3)
		{
			if(version >= 5)
			{
				//help
				for(i = 0; i < 11; i++)
				{
					profilesIt->data->helpDisplayed[i] = readInt(file) != 0;
				}
			}
			else
			{
				//help
				for(i = 0; i < 10; i++)
				{
					profilesIt->data->helpDisplayed[i] = readInt(file) != 0;
				}
			}

			if(version >= 4)
			{
				//prizes
				for(i = 0; i < 10; i++)
				{
					profilesIt->data->prizeGot[i][0] = readInt(file) != 0;
					profilesIt->data->prizeGot[i][1] = readInt(file) != 0;
				}

				//costume last used
				if(version >= 6)
				{
					profilesIt->data->costume = readInt(file) != 0;

					//costumes unlocked
					if(version >= 7)
					{
						profilesIt->data->costumesUnlocked = readInt(file) != 0;
					}
				}
			}
		}
	}

	file.close();
}

#endif
