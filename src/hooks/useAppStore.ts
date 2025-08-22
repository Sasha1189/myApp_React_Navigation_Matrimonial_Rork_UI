import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo } from 'react';
import { Profile, Match } from '../types/profile';
import { mockProfiles } from '../mocks/profiles';
import { mockMatches } from '../mocks/matches';

interface AppState {
  currentProfileIndex: number;
  profiles: Profile[];
  matches: Match[];
  likedProfiles: string[];
  passedProfiles: string[];
  superLikedProfiles: string[];
}

const STORAGE_KEY = 'dating_app_state';

export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>({
    currentProfileIndex: 0,
    profiles: mockProfiles,
    matches: mockMatches,
    likedProfiles: [],
    passedProfiles: [],
    superLikedProfiles: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          currentProfileIndex: parsed.currentProfileIndex || 0,
          likedProfiles: parsed.likedProfiles || [],
          passedProfiles: parsed.passedProfiles || [],
          superLikedProfiles: parsed.superLikedProfiles || [],
          matches: [...mockMatches, ...(parsed.newMatches || [])],
        }));
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: Partial<AppState>) => {
    try {
      const updated = { ...state, ...newState };
      setState(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentProfileIndex: updated.currentProfileIndex,
        likedProfiles: updated.likedProfiles,
        passedProfiles: updated.passedProfiles,
        superLikedProfiles: updated.superLikedProfiles,
        newMatches: updated.matches.filter(m => !mockMatches.find(mm => mm.id === m.id)),
      }));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const currentProfile = useMemo(() => {
    if (state.currentProfileIndex >= state.profiles.length) return null;
    return state.profiles[state.currentProfileIndex];
  }, [state.currentProfileIndex, state.profiles]);

  const likeProfile = async (profileId: string) => {
    console.log('Liking profile:', profileId);
    const newLiked = [...state.likedProfiles, profileId];
    const isMatch = Math.random() > 0.5; // 50% chance of match
    
    let newMatches = state.matches;
    if (isMatch) {
      const profile = state.profiles.find(p => p.id === profileId);
      if (profile) {
        newMatches = [...state.matches, {
          id: `m${Date.now()}`,
          profile,
          matchedAt: new Date(),
          unreadCount: 0,
        }];
      }
    }
    
    await saveState({
      likedProfiles: newLiked,
      currentProfileIndex: state.currentProfileIndex + 1,
      matches: newMatches,
    });
    
    return isMatch;
  };

  const passProfile = async (profileId: string) => {
    console.log('Passing profile:', profileId);
    const newPassed = [...state.passedProfiles, profileId];
    await saveState({
      passedProfiles: newPassed,
      currentProfileIndex: state.currentProfileIndex + 1,
    });
  };

  const superLikeProfile = async (profileId: string) => {
    console.log('Super liking profile:', profileId);
    const newSuperLiked = [...state.superLikedProfiles, profileId];
    const isMatch = Math.random() > 0.3; // 70% chance of match for super like
    
    let newMatches = state.matches;
    if (isMatch) {
      const profile = state.profiles.find(p => p.id === profileId);
      if (profile) {
        newMatches = [...state.matches, {
          id: `m${Date.now()}`,
          profile,
          matchedAt: new Date(),
          unreadCount: 0,
        }];
      }
    }
    
    await saveState({
      superLikedProfiles: newSuperLiked,
      currentProfileIndex: state.currentProfileIndex + 1,
      matches: newMatches,
    });
    
    return isMatch;
  };

  const resetProfiles = async () => {
    await saveState({
      currentProfileIndex: 0,
      likedProfiles: [],
      passedProfiles: [],
      superLikedProfiles: [],
    });
  };

  return {
    ...state,
    currentProfile,
    isLoading,
    likeProfile,
    passProfile,
    superLikeProfile,
    resetProfiles,
    hasMoreProfiles: state.currentProfileIndex < state.profiles.length,
  };
});

export const useCurrentProfile = () => {
  const { currentProfile, hasMoreProfiles } = useApp();
  return { currentProfile, hasMoreProfiles };
};

export const useMatches = () => {
  const { matches } = useApp();
  return matches;
};