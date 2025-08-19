import { theme } from '../../../theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
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

type HelpSupportScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'HelpSupport'>;

interface HelpItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const HelpItem: React.FC<HelpItemProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.helpItem} onPress={onPress}>
    <View style={styles.helpIcon}>{icon}</View>
    <View style={styles.helpText}>
      <Text style={styles.helpTitle}>{title}</Text>
      <Text style={styles.helpSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight size={20} color={theme.colors.textLight} />
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Help & Support',
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

  const handleContactSupport = () => {
    // Implement contact support logic
    console.log('Contacting support...');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <HelpCircle size={32} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>How can we help you?</Text>
        <Text style={styles.headerSubtitle}>
          Find answers to common questions or get in touch with our support team
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Topics</Text>
        <HelpItem
          icon={<MessageCircle size={24} color={theme.colors.primary} />}
          title="Messaging Issues"
          subtitle="Problems with sending or receiving messages"
          onPress={() => {}}
        />
        <HelpItem
          icon={<FileText size={24} color={theme.colors.primary} />}
          title="Account Settings"
          subtitle="Profile, privacy, and notification settings"
          onPress={() => {}}
        />
        <HelpItem
          icon={<HelpCircle size={24} color={theme.colors.primary} />}
          title="Getting Started"
          subtitle="New user guide and basic features"
          onPress={() => {}}
        />
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSupport}
        >
          <Mail size={24} color={theme.colors.primary} />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
        <Text style={styles.responseTime}>
          Average response time: 24 hours
        </Text>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {[
          'How do I change my profile pictures?',
          'How do I update my location?',
          'How do I cancel my subscription?',
          'How do I report a user?',
        ].map((question, index) => (
          <TouchableOpacity key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{question}</Text>
            <ChevronRight size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
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
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  helpIcon: {
    marginRight: theme.spacing.lg,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  contactSection: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  contactButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.md,
  },
  responseTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  faqSection: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.lg,
  },
  faqTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  faqQuestion: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
});
