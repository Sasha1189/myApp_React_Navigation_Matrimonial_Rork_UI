import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMatches } from '../../../hooks/useAppStore';
import { theme } from '../../../constants/theme';
import { useAppNavigation } from "../../../navigation/hooks";
// import { Stack } from 'expo-router';

export default function MatchesScreen() {
  const matches = useMatches();
  const navigation = useAppNavigation();

  return (
      <LinearGradient
        colors={[theme.colors.background, 'white']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.newMatchesContainer}
          >
            {matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={styles.newMatchCard}
                onPress={() => navigation.navigate("Chat", { matchId: match.id })}
              >
                <Image 
                  source={{ uri: match.profile.images[0] }} 
                  style={styles.newMatchImage}
                />
                <Text style={styles.newMatchName}>{match.profile.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No matches yet</Text>
              <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
            </View>
          ) : (
            <View style={styles.activityContainer}>
              {matches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate("Chat", { matchId: match.id })}
                    // router.push(`/chat/${match.id}`)}
                >
                  <Image 
                    source={{ uri: match.profile.images[0] }} 
                    style={styles.activityImage}
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{match.profile.name}, {match.profile.age}</Text>
                    <Text style={styles.activityText}>You matched!</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  newMatchesContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  newMatchCard: {
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  newMatchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.xs,
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  newMatchName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  activityContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
});

  {/* <Stack.Screen 
        options={{ 
          title: "Matches",
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: 'white',
        }}  /> */}