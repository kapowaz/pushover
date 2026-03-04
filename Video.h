#ifndef __VIDEO_H
#define __VIDEO_H

#define MAXFRAMES 42000 //20 mins of videoramablend

bool upHit[MAXFRAMES];
bool downHit[MAXFRAMES];
bool leftHit[MAXFRAMES];
bool rightHit[MAXFRAMES];
bool fireHit[MAXFRAMES];

bool upDown[MAXFRAMES];
bool downDown[MAXFRAMES];
bool leftDown[MAXFRAMES];
bool rightDown[MAXFRAMES];
bool fireDown[MAXFRAMES];

//bool recording(false); //moved to main.cpp
//bool playing(false);
//int frame(0);
//int totalFrames(0);

void beginVideoRecord() //sets recording at frame 0
{
	if(!playing)
	{
		recording = true;
		frame = 0;
	}
}

void endVideoRecord()   //stops recording
{
	if(recording)
	{
		totalFrames = frame;
		recording = false;
	}
}

void putVideoInput()    //stores player input into arrays
{
	if(recording)
	{
		upHit[frame] = ants.first->data->contHit(CONTUP, true);
		downHit[frame] = ants.first->data->contHit(CONTDOWN, true);
		leftHit[frame] = ants.first->data->contHit(CONTLEFT, true);
		rightHit[frame] = ants.first->data->contHit(CONTRIGHT, true);
		fireHit[frame] = ants.first->data->contHit(CONTFIRE, true);

		upDown[frame] = ants.first->data->contDown(CONTUP);
		downDown[frame] = ants.first->data->contDown(CONTDOWN);
		leftDown[frame] = ants.first->data->contDown(CONTLEFT);
		rightDown[frame] = ants.first->data->contDown(CONTRIGHT);
		fireDown[frame] = ants.first->data->contDown(CONTFIRE);

		if(frame == MAXFRAMES - 1)
		{
			endVideoRecord();
		}

		frame++;
	}
}

void saveVideo()        //writes vid to file
{
	ofstream file;

	char filename[1024] = "";
	sprintf(filename, "Data\\Map\\%i\\Video\\%i.vid", mapSet, currentMap);
	file.open(filename, ios::out | ios::binary);

	if(!file.fail())
	{
		for(frame = 0; frame <= totalFrames; frame++)
		{
			bwriteBool(file, upHit[frame]);
			bwriteBool(file, downHit[frame]);
			bwriteBool(file, leftHit[frame]);
			bwriteBool(file, rightHit[frame]);
			bwriteBool(file, fireHit[frame]);

			bwriteBool(file, upDown[frame]);
			bwriteBool(file, downDown[frame]);
			bwriteBool(file, leftDown[frame]);
			bwriteBool(file, rightDown[frame]);
			bwriteBool(file, fireDown[frame]);
		}

		file.close();
	}
}

void advanceVideoPlay()
{
	if(playing)
	{
		frame++;
		if(frame > totalFrames)
			endVideoPlay();
	}
}

void beginVideoPlay()   //loads vid from file, sets frame 0
{
	if(!recording)
	{
		ifstream file;

		char filename[1024] = "";
		sprintf(filename, "Data\\Map\\%i\\Video\\%i.vid", mapSet, currentMap);
		file.open(filename, ios::in | ios::binary);

		if(!file.fail())
		{
			frame = 0;
			while(!file.eof())
			{
				breadBool(file, upHit[frame]);
				breadBool(file, downHit[frame]);
				breadBool(file, leftHit[frame]);
				breadBool(file, rightHit[frame]);
				breadBool(file, fireHit[frame]);

				breadBool(file, upDown[frame]);
				breadBool(file, downDown[frame]);
				breadBool(file, leftDown[frame]);
				breadBool(file, rightDown[frame]);
				breadBool(file, fireDown[frame]);

				frame++;
			}

			playing = true;
			totalFrames = frame - 1;
			frame = -1;

			file.close();
		}
	}
}

void endVideoPlay()     //sets playing to 0
{
	playing = 0;
}

bool contHitVideo(int cont)    //replaces keyHit
{
	if(frame < 0) return false;

	switch(cont)
	{
	case CONTUP:
		return upHit[frame];
	case CONTDOWN:
		return downHit[frame];
	case CONTLEFT:
		return leftHit[frame];
	case CONTRIGHT:
		return rightHit[frame];
	case CONTFIRE:
		return fireHit[frame];
	default:
		return false;
	}
}

bool contDownVideo(int cont)   //replaces keyDown
{
	if(frame < 0) return false;

	switch(cont)
	{
	case CONTUP:
		return upDown[frame];
	case CONTDOWN:
		return downDown[frame];
	case CONTLEFT:
		return leftDown[frame];
	case CONTRIGHT:
		return rightDown[frame];
	case CONTFIRE:
		return fireDown[frame];
	default:
		return false;
	}
}

#endif