import { theme } from '../../../theme/index';
import { LinearGradient } from 'expo-linear-gradient';
// import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Bug,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface HelpItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  type: 'navigation' | 'external' | 'action';
  onPress: () => void;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

export default function HelpSupportScreen() {
  const handleFAQ = () => {
    // router.push('/faq' as any);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@example.com') },
        { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat is available Monday to Friday, 9 AM to 6 PM.',
      [
        { text: 'Start Chat', onPress: () => console.log('Start live chat') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReportBug = () => {
    // router.push('/report-bug' as any);
  };

  const handleFeatureRequest = () => {
    // router.push('/feature-request' as any);
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App',
      'If you enjoy using our app, please take a moment to rate it!',
      [
        { text: 'Rate Now', onPress: () => console.log('Open app store rating') },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  const handleTerms = () => {
    // router.push('/terms-conditions' as any);
  };

  const handlePrivacyPolicy = () => {
    // router.push('/privacy-policy' as any);
  };

  const handleCommunityGuidelines = () => {
    // router.push('/community-guidelines' as any);
  };

  const helpSections: HelpSection[] = [
    {
      title: 'Get Help',
      items: [
        {
          id: 'faq',
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to common questions',
          icon: HelpCircle,
          type: 'navigation',
          onPress: handleFAQ,
        },
        {
          id: 'liveChat',
          title: 'Live Chat',
          subtitle: 'Chat with our support team',
          icon: MessageCircle,
          type: 'action',
          onPress: handleLiveChat,
        },
        {
          id: 'contactSupport',
          title: 'Contact Support',
          subtitle: 'Email or call our support team',
          icon: Mail,
          type: 'action',
          onPress: handleContactSupport,
        },
      ],
    },
    {
      title: 'Feedback',
      items: [
        {
          id: 'reportBug',
          title: 'Report a Bug',
          subtitle: 'Let us know about any issues',
          icon: Bug,
          type: 'navigation',
          onPress: handleReportBug,
        },
        {
          id: 'featureRequest',
          title: 'Request a Feature',
          subtitle: 'Suggest new features or improvements',
          icon: Star,
          type: 'navigation',
          onPress: handleFeatureRequest,
        },
        {
          id: 'rateApp',
          title: 'Rate Our App',
          subtitle: 'Share your experience with others',
          icon: Star,
          type: 'action',
          onPress: handleRateApp,
        },
      ],
    },
    {
      title: 'Legal & Policies',
      items: [
        {
          id: 'terms',
          title: 'Terms & Conditions',
          subtitle: 'Read our terms of service',
          icon: FileText,
          type: 'navigation',
          onPress: handleTerms,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'Learn how we protect your data',
          icon: FileText,
          type: 'navigation',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'guidelines',
          title: 'Community Guidelines',
          subtitle: 'Our community standards',
          icon: FileText,
          type: 'navigation',
          onPress: handleCommunityGuidelines,
        },
      ],
    },
  ];

  const renderHelpItem = (item: HelpItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.helpItem}
        onPress={item.onPress}
      >
        <View style={styles.helpLeft}>
          <View style={styles.iconContainer}>
            <item.icon size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>{item.title}</Text>
            <Text style={styles.helpSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.helpRight}>
          {item.type === 'external' ? (
            <ExternalLink size={20} color={theme.colors.textLight} />
          ) : (
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
          title: 'Help & Support',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: 'white',
          headerLeft: () => (
            <TouchableOpacity 
            // onPress={() => router.back()}
            >
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
            <HelpCircle size={32} color={theme.colors.primary} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>How can we help?</Text>
              <Text style={styles.headerText}>
                We&apos;re here to help you have the best experience possible.
              </Text>
            </View>
          </View>

          {helpSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderHelpItem)}
              </View>
            </View>
          ))}

          <View style={styles.supportHoursCard}>
            <Clock size={24} color={theme.colors.accent} />
            <View style={styles.supportHoursContent}>
              <Text style={styles.supportHoursTitle}>Support Hours</Text>
              <Text style={styles.supportHoursText}>
                Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
                Saturday - Sunday: 10:00 AM - 4:00 PM{'\n'}
                All times are in your local timezone.
              </Text>
            </View>
          </View>

          <View style={styles.emergencyCard}>
            <Phone size={24} color={theme.colors.danger} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency Support</Text>
              <Text style={styles.emergencyText}>
                For urgent safety concerns, contact us immediately at:
              </Text>
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={() => Linking.openURL('tel:+1234567890')}
              >
                <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  helpLeft: {
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
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  helpSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  helpRight: {
    marginLeft: theme.spacing.md,
  },
  supportHoursCard: {
    backgroundColor: theme.colors.accent + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  supportHoursContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  supportHoursTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  supportHoursText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: theme.colors.danger + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
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