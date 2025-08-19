import { theme } from '../../../theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Bell, Eye, Lock, MapPin } from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppStackParamList } from '../../../navigation/types';

type SafetyPrivacyScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'SafetyPrivacy'>;

interface PrivacyOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const PrivacyOption: React.FC<PrivacyOptionProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}) => (
  <View style={styles.optionContainer}>
    <View style={styles.optionHeader}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor="white"
    />
  </View>
);

export default function SafetyPrivacyScreen() {
  const navigation = useNavigation<SafetyPrivacyScreenNavigationProp>();
  const [isProfileVisible, setIsProfileVisible] = React.useState(true);
  const [showLocation, setShowLocation] = React.useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = React.useState(true);
  const [showReadReceipts, setShowReadReceipts] = React.useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Safety & Privacy',
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Lock size={32} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <Text style={styles.headerDescription}>
          Control your visibility and protect your privacy
        </Text>
      </View>

      <View style={styles.section}>
        <PrivacyOption
          icon={<Eye size={24} color={theme.colors.primary} />}
          title="Profile Visibility"
          description="Show your profile in discovery"
          value={isProfileVisible}
          onValueChange={setIsProfileVisible}
        />

        <PrivacyOption
          icon={<MapPin size={24} color={theme.colors.primary} />}
          title="Show Location"
          description="Allow others to see your approximate location"
          value={showLocation}
          onValueChange={setShowLocation}
        />

        <PrivacyOption
          icon={<Bell size={24} color={theme.colors.primary} />}
          title="Online Status"
          description="Show when you're active on the app"
          value={showOnlineStatus}
          onValueChange={setShowOnlineStatus}
        />

        <PrivacyOption
          icon={<Eye size={24} color={theme.colors.primary} />}
          title="Read Receipts"
          description="Show when you've read messages"
          value={showReadReceipts}
          onValueChange={setShowReadReceipts}
        />
      </View>

      <TouchableOpacity style={styles.blockButton}>
        <Text style={styles.blockButtonText}>Blocked Users</Text>
        <Text style={styles.blockCount}>3</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Safety Tips</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            • Meet in public places for the first time{'\n'}
            • Tell a friend about your plans{'\n'}
            • Trust your instincts{'\n'}
            • Report inappropriate behavior{'\n'}
            • Keep personal information private
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  optionContainer: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  blockButton: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blockButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.danger,
    fontWeight: '500',
  },
  blockCount: {
    backgroundColor: theme.colors.danger + '20',
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  infoSection: {
    padding: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
});
