import { ActionButtons } from '../../../components/ActionButtons';
import { SwipeCard } from '../../../components/SwipeCard';
import { useTheme } from "../../../theme/useTheme";
// import { theme } from '../../../constants/theme';
import { useApp } from '../../../hooks/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabNavigation } from "../../../navigation/hooks";
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { EmptyState } from "../../../components/EmptyState";

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    currentProfile,
    hasMoreProfiles,
    likeProfile,
    passProfile,
    superLikeProfile,
    resetProfiles,
    isLoading,
  } = useApp();

  const navigation = useTabNavigation();

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<typeof currentProfile>(null);

  const handleLike = async () => {
    if (!currentProfile) return;
    const isMatch = await likeProfile(currentProfile.id);
    if (isMatch) {
      setMatchedProfile(currentProfile);
      setShowMatchModal(true);
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    await passProfile(currentProfile.id);
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;
    const isMatch = await superLikeProfile(currentProfile.id);
    if (isMatch) {
      setMatchedProfile(currentProfile);
      setShowMatchModal(true);
    }
  };

  const handleMessage = () => {
    setShowMatchModal(false);
    navigation.navigate("Messages");
    // router.push('/messages');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!hasMoreProfiles) {
    return (
      <LinearGradient colors={[theme.colors.background, "white"]} style={styles.container}>
      <EmptyState
        title="No more profiles!"
        subtitle="Check back later for more matches"
        buttonText="Start Over"
        onButtonPress={resetProfiles}
      />
    </LinearGradient>
    );
  }

  return (
      <LinearGradient
        colors={[theme.colors.background, 'white']}
        style={styles.container}
      >
        <View style={styles.cardsContainer}>
        {currentProfile && (
          <SwipeCard
            profile={currentProfile}
            onSwipeLeft={handlePass}
            onSwipeRight={handleLike}
            onSwipeUp={handleSuperLike}
            isTopCard={true}
          />
          )} 
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.rightActions}>
           <ActionButtons
            onPass={handlePass}
            onLike={handleLike}
            onSuperLike={handleSuperLike}
            disabled={!currentProfile}
            />
          </View>
        </View>
      </LinearGradient>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noMoreText: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  noMoreSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
  },
  resetButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  actionsContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    alignItems: 'flex-end',
  },
  rightActions: {
    alignItems: 'center',
  },
  infoButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
});
