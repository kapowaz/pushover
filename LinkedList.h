/***************************************************************

  Basic C++ Linked List Using Templates
  Altered Version for use with QBuff

  Copyright 2006 Mintsoft [Robert Emery]

  Example of Usage:

	List<double> Buffer;

	double ReadStruct;
	fread(&ReadStruct,sizeof(double),1,FilePointer);
	Buffer.addback(&ReadStruct); 

  Also
	
	Buffer.addfront(&ReadStruct);

  Also both can be used with the "new" keyword like so:

	Buffer.addfront(new Enemy(100,100,250,1,1));
	Buffer.addback(new Enemy(100,100,250,1,1));

  For output
	
	Buffer.first->data is a pointer 
	to the Variable/Struct/Class given with .addback

****************************************************************/

#ifndef __LinkListH
#define __LinkListH

#include <iostream>
using namespace std;

#define NE(ListEl) (ListEl)=(ListEl)->next
#define PE(ListEl) (ListEl)=(ListEl)->prev

template <class T>
class ListElement {
public:
	T* data;
	ListElement *next;
	ListElement *prev;

	ListElement(T* D, ListElement *n, ListElement *p)
	{
		data=(T*)malloc(sizeof(*D));
		memcpy(data,D,sizeof(*D));
		next=n;		prev=p;
	}
};

template <class T>
class List {
public:
	List() {
		first=NULL;
		last=NULL;	}
	~List() {	}
	addback(T* NewData);
	addfront(T* NewData);
	del(ListElement<T> *ThisElement);
	ListElement<T> *first;
	ListElement<T> *last;
};

template <class T>
List<T>::addback(T *NewData)
{

	ListElement<T>* NewElement=new ListElement<T>(NewData,NULL,List::last);
	if(List::last)
	{
		List::last->next=NewElement;
	}
	List::last=NewElement;
	if(!List::first)
	{
		List::first=NewElement;
		NewElement->prev=NULL;
	}
	NewElement->next=NULL;
}

template <class T>
List<T>::addfront(T* NewData)
{
	ListElement<T>* NewElement=new ListElement<T>(NewData,List::first,NULL);
	if(!List::last)
	{
		List::last=NewElement;
	}
	if(List::first)
	{
		List::first->prev=NewElement;
	}
	NewElement->next=List::first;
	List::first=NewElement;
	NewElement->prev=NULL;
	
}

template <class T>
List<T>::del(ListElement<T> *ThisElement)
{
	ListElement<T> *p;
	ListElement<T> *n;
	p=ThisElement->prev;
	n=ThisElement->next;
	if(ThisElement!=List<T>::first)
	{
		if(p)
			p->next=ThisElement->next;
	}
	else
	{
		List<T>::first=ThisElement->next;
	}

	if(ThisElement!=List<T>::last)
	{
		if(n)
			n->prev=ThisElement->prev;
	}
	else
	{
		List<T>::last=ThisElement->prev;
	}
	
	free(ThisElement->data);
	delete ThisElement;
}

#endif
