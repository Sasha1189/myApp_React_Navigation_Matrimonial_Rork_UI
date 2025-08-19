import { theme } from '../../../theme/index';
import { LinearGradient } from 'expo-linear-gradient';
// import { Stack, router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  Lock,
  MapPin,
  Phone,
  Shield,
  UserX,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SafetyItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  type: 'toggle' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  isWarning?: boolean;
}

interface SafetySection {
  title: string;
  items: SafetyItem[];
}

export default function SafetyPrivacyScreen() {
  const [settings, setSettings] = useState({
    hideProfile: false,
    hideLastSeen: true,
    hidePhotos: false,
    blockScreenshots: false,
    requirePhoneVerification: true,
    showDistanceOnly: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBlockedUsers = () => {
    // router.push('/blocked-users' as any);
  };

  const handleReportUser = () => {
    Alert.alert(
      'Report a User',
      'If someone is making you uncomfortable or violating our community guidelines, please report them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', onPress: () => console.log('Report user') },
      ]
    );
  };

  const handleSafetyTips = () => {
    // router.push('/safety-tips' as any);
  };

  const handlePrivacyPolicy = () => {
    // router.push('/privacy-policy' as any);
  };

  const safetySections: SafetySection[] = [
    {
      title: 'Profile Privacy',
      items: [
        {
          id: 'hideProfile',
          title: 'Hide Profile',
          subtitle: 'Make your profile invisible to others temporarily',
          icon: EyeOff,
          type: 'toggle',
          value: settings.hideProfile,
        },
        {
          id: 'hideLastSeen',
          title: 'Hide Last Seen',
          subtitle: 'Don&apos;t show when you were last active',
          icon: Eye,
          type: 'toggle',
          value: settings.hideLastSeen,
        },
        {
          id: 'hidePhotos',
          title: 'Private Photos',
          subtitle: 'Only show photos to matched users',
          icon: Camera,
          type: 'toggle',
          value: settings.hidePhotos,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'blockScreenshots',
          title: 'Block Screenshots',
          subtitle: 'Prevent others from taking screenshots of your profile',
          icon: Lock,
          type: 'toggle',
          value: settings.blockScreenshots,
        },
        {
          id: 'requirePhoneVerification',
          title: 'Phone Verification Required',
          subtitle: 'Only show verified profiles',
          icon: Phone,
          type: 'toggle',
          value: settings.requirePhoneVerification,
        },
        {
          id: 'showDistanceOnly',
          title: 'Show Distance Only',
          subtitle: 'Hide exact location, show distance only',
          icon: MapPin,
          type: 'toggle',
          value: settings.showDistanceOnly,
        },
      ],
    },
    {
      title: 'Safety Tools',
      items: [
        {
          id: 'blockedUsers',
          title: 'Blocked Users',
          subtitle: 'Manage users you have blocked',
          icon: UserX,
          type: 'navigation',
          onPress: handleBlockedUsers,
        },
        {
          id: 'reportUser',
          title: 'Report a User',
          subtitle: 'Report inappropriate behavior',
          icon: Flag,
          type: 'navigation',
          onPress: handleReportUser,
          isWarning: true,
        },
        {
          id: 'safetyTips',
          title: 'Safety Tips',
          subtitle: 'Learn how to stay safe while dating',
          icon: Shield,
          type: 'navigation',
          onPress: handleSafetyTips,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacyPolicy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy and terms',
          icon: AlertTriangle,
          type: 'navigation',
          onPress: handlePrivacyPolicy,
        },
      ],
    },
  ];

  const renderSafetyItem = (item: SafetyItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.safetyItem,
          item.isWarning && styles.warningItem,
        ]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.safetyLeft}>
          <View style={[
            styles.iconContainer,
            item.isWarning && styles.warningIconContainer,
          ]}>
            <item.icon 
              size={20} 
              color={item.isWarning ? theme.colors.danger : theme.colors.primary} 
            />
          </View>
          <View style={styles.safetyContent}>
            <Text style={[
              styles.safetyTitle,
              item.isWarning && styles.warningTitle,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.safetySubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.safetyRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => updateSetting(item.id, value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '40',
              }}
              thumbColor={
                item.value ? theme.colors.primary : theme.colors.textLight
              }
            />
          )}
          {item.type === 'navigation' && (
            <ChevronRight size={20} color={theme.colors.textLight} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerShown: true,
          title: 'Safety & Privacy',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      /> */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.primary + '20', 'transparent']}
          style={styles.headerGradient}
        />
        
        <View style={styles.content}>
          <View style={styles.headerCard}>
            <Shield size={32} color={theme.colors.primary} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Safety Matters</Text>
              <Text style={styles.headerText}>
                Control who can see your information and how you interact with others.
              </Text>
            </View>
          </View>

          {safetySections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSafetyItem)}
              </View>
            </View>
          ))}

          <View style={styles.emergencyCard}>
            <AlertTriangle size={24} color={theme.colors.danger} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency?</Text>
              <Text style={styles.emergencyText}>
                If you&apos;re in immediate danger, contact local emergency services.
              </Text>
              <TouchableOpacity style={styles.emergencyButton}>
                <Text style={styles.emergencyButtonText}>Emergency Contacts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  warningItem: {
    backgroundColor: theme.colors.danger + '05',
  },
  safetyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  warningIconContainer: {
    backgroundColor: theme.colors.danger + '20',
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  warningTitle: {
    color: theme.colors.danger,
  },
  safetySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  safetyRight: {
    marginLeft: theme.spacing.md,
  },
  emergencyCard: {
    backgroundColor: theme.colors.danger + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  emergencyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginBottom: theme.spacing.xs,
  },
  emergencyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  emergencyButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});