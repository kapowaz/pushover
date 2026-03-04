#ifndef __CONFIG_H
#define __CONFIG_H

int helpMessageNum(0);
bool music(1);
bool sound(1);
bool windowed(1);

void saveConfig()
{
	ofstream file;
	file.open("Data\\Profiles\\Config.dat");
	if(file.fail()) return;

	//version
	writeInt(file, 2);

	//help message number
	writeInt(file, helpMessageNum);

	writeInt(file, static_cast<int>(music));
	writeInt(file, static_cast<int>(sound));
	writeInt(file, static_cast<int>(windowed));

	file.close();
}

void loadConfig()
{
	int version;

	ifstream file;
	file.open("Data\\Profiles\\Config.dat");
	if(!file.fail())
	{
		//version
		version = readInt(file);

		//help message number
		helpMessageNum = readInt(file);

		if(version >= 2)
		{
			music = readInt(file) != 0;
			sound = readInt(file) != 0;
			windowed = readInt(file) != 0;
		}

		file.close();
	}
	else
	{
		helpMessageNum = 0;
	}
}

#endif