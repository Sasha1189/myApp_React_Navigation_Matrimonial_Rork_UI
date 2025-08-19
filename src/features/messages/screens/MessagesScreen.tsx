import { useMatches } from '../../../hooks/useAppStore';
import { theme } from '../../../theme/index';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MatchCard } from '../../../components/MatchCard';
import { AppStackParamList, TabParamList } from '../../../navigation/types';

type MessagesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Messages'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function MessagesScreen() {
  const matches = useMatches();
  const [activeTab, setActiveTab] = useState<'chats' | 'sent' | 'received'>('chats');
  const navigation = useNavigation<MessagesScreenNavigationProp>();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Messages",
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: 'white',
    });
  }, [navigation]);

  const renderTabButton = (tab: 'chats' | 'sent' | 'received', label: string, icon: React.ComponentType<any>) => {
    const Icon = icon;
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
        onPress={() => setActiveTab(tab)}
      >
        <Icon size={16} color={activeTab === tab ? 'white' : theme.colors.primary} />
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, 'white']}
      style={styles.container}
    >
      <View style={styles.tabsContainer}>
        {renderTabButton('chats', 'Chats', MessageCircle)}
        {renderTabButton('sent', 'Likes Sent', Send)}
        {renderTabButton('received', 'Likes Received', Heart)}
      </View>
      
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {activeTab === 'chats' ? 'No messages yet' : 
             activeTab === 'sent' ? 'No likes sent yet' : 'No likes received yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'chats' ? 'When you match with someone, you can message them here!' :
             activeTab === 'sent' ? 'Start liking profiles to see them here!' :
             'When someone likes you, they will appear here!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchCard match={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
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
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  activeTabText: {
    color: 'white',
  },
});
