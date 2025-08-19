import { theme } from '../../../theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  UserCog,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppStackParamList } from '../../../navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Settings'>;

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIcon}>
      {icon}
      {showBadge && <View style={styles.badge} />}
    </View>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <ChevronRight size={20} color={theme.colors.textLight} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Settings',
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: 'white',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <SettingItem
          icon={<UserCog size={24} color={theme.colors.primary} />}
          title="Account Settings"
          subtitle="Privacy, security, and account details"
          onPress={() => {}}
        />
        <SettingItem
          icon={<Bell size={24} color={theme.colors.primary} />}
          title="Notifications"
          subtitle="Messages, matches, and app updates"
          onPress={() => {}}
          showBadge
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<CreditCard size={24} color={theme.colors.primary} />}
          title="Subscription"
          subtitle="Manage your premium features"
          onPress={() => navigation.navigate('Subscription')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<Shield size={24} color={theme.colors.primary} />}
          title="Safety & Privacy"
          onPress={() => navigation.navigate('SafetyPrivacy')}
        />
        <SettingItem
          icon={<HelpCircle size={24} color={theme.colors.primary} />}
          title="Help & Support"
          onPress={() => navigation.navigate('HelpSupport')}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon={<LogOut size={24} color={theme.colors.danger} />}
          title="Log Out"
          onPress={handleLogout}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <TouchableOpacity>
          <Text style={styles.link}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginVertical: theme.spacing.sm,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'white',
  },
  settingIcon: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  version: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  link: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
    textDecorationLine: 'underline',
  },
});
