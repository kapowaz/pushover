#ifndef __CONTROLSHEADER
#define __CONTROLSHEADER

struct _PlayerControl
{
	int left, right, up, down;
	int fire1,fire2,fire3,fire4;
	int fire5,fire6,fire7,fire8;
} P1Cont,P2Cont;

void SetControls(void) {
	//Player1
	P1Cont.down=	SDLK_DOWN;
	P1Cont.left=	SDLK_LEFT;
	P1Cont.right=	SDLK_RIGHT;
	P1Cont.up=		SDLK_UP;
	P1Cont.fire1=	SDLK_a;
	P1Cont.fire2=	SDLK_s;
	P1Cont.fire3=	SDLK_d;
	P1Cont.fire4=	SDLK_f;
	P1Cont.fire5=	SDLK_z;
	P1Cont.fire6=	SDLK_x;
	P1Cont.fire7=	SDLK_c;
	P1Cont.fire8=	SDLK_v;

	//Player2
	P2Cont.down=	NULL;
	P2Cont.left=	NULL;
	P2Cont.right=	NULL;
	P2Cont.up=		NULL;
	P2Cont.fire1=	NULL;
	P2Cont.fire2=	NULL;
	P2Cont.fire3=	NULL;
	P2Cont.fire4=	NULL;
	P2Cont.fire5=	NULL;
	P2Cont.fire6=	NULL;
	P2Cont.fire7=	NULL;
	P2Cont.fire8=	NULL;
}

#endif