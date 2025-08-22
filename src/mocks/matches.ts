import { Match } from '../types/profile';

export const mockMatches: Match[] = [
  {
    id: 'm1',
    profile: {
      id: '10',
      name: 'Sarah',
      age: 25,
      bio: 'Love to laugh and make others smile',
      images: ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800'],
      distance: 3,
      interests: ['Comedy', 'Travel'],
      occupation: 'Teacher',
    },
    matchedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    lastMessage: 'Hey! How are you?',
    unreadCount: 2,
  },
  {
    id: 'm2',
    profile: {
      id: '11',
      name: 'Jessica',
      age: 29,
      bio: 'Entrepreneur and adventure seeker',
      images: ['https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800'],
      distance: 5,
      interests: ['Business', 'Hiking'],
      occupation: 'CEO',
    },
    matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    lastMessage: 'Would love to grab coffee sometime!',
    unreadCount: 0,
  },
  {
    id: 'm3',
    profile: {
      id: '12',
      name: 'Emily',
      age: 26,
      bio: 'Music is my life',
      images: ['https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?w=800'],
      distance: 2,
      interests: ['Music', 'Concerts'],
      occupation: 'Musician',
    },
    matchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    lastMessage: 'That concert was amazing!',
    unreadCount: 0,
  },
];