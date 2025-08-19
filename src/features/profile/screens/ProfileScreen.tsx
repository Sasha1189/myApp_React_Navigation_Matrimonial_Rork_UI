import React from 'react';
import { useAppNavigation } from '../../../navigation/hooks';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Edit3, Camera, Shield, HelpCircle, LogOut } from 'lucide-react-native';
import { theme } from '../../../constants/theme';

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const menuItems = [
    {
      icon: Edit3, label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile')
    },
    {
      icon: Camera, label: 'Manage Photos',
      onPress: () => navigation.navigate('ManagePhotos')
    },
    {
      icon: Settings, label: 'Settings',
      onPress: () => navigation.navigate('Settings')
    },
    {
      icon: Shield, label: 'Safety & Privacy',
      onPress: () => navigation.navigate('SafetyPrivacy')
    },
    {
      icon: HelpCircle, label: 'Help & Support',
      onPress: () => navigation.navigate('HelpSupport')
    },
    {
      icon: LogOut, label: 'Log Out',
      onPress: () => navigation.navigate('/landing' as any), danger: true
    },
  ];
  return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileAge}>28 years old</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>42</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>Likes Sent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>89</Text>
                <Text style={styles.statLabel}>Likes Received</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <item.icon 
                  size={22} 
                  color={item.danger ? theme.colors.danger : theme.colors.text} 
                />
                <Text style={[
                  styles.menuItemText,
                  item.danger && styles.menuItemTextDanger
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.premiumBanner}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumGradient}
            />
            <Text style={styles.premiumTitle}>Get Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Unlimited likes, see who likes you, and more!
            </Text>
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  profileAge: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: theme.spacing.md,
  },
  menuSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    minHeight: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  menuItemTextDanger: {
    color: theme.colors.danger,
  },
  premiumBanner: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  premiumGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  premiumTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  premiumSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
  },
  premiumButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});