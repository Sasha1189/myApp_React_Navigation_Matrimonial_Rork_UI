import { theme } from '../../../theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2, Crown, Star, Zap } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppStackParamList } from '../../../navigation/types';

type SubscriptionScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Subscription'>;

interface PlanFeatureProps {
  icon: React.ReactNode;
  title: string;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ icon, title }) => (
  <View style={styles.featureItem}>
    {icon}
    <Text style={styles.featureText}>{title}</Text>
  </View>
);

interface SubscriptionPlanProps {
  title: string;
  price: string;
  duration: string;
  isPopular?: boolean;
  onSelect: () => void;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  duration,
  isPopular,
  onSelect,
}) => (
  <TouchableOpacity
    style={[styles.planCard, isPopular && styles.popularPlan]}
    onPress={onSelect}
  >
    {isPopular && (
      <View style={styles.popularBadge}>
        <Crown size={16} color="white" />
        <Text style={styles.popularText}>Most Popular</Text>
      </View>
    )}
    <Text style={[styles.planTitle, isPopular && styles.popularTitle]}>
      {title}
    </Text>
    <View style={styles.priceContainer}>
      <Text style={[styles.planPrice, isPopular && styles.popularTitle]}>
        {price}
      </Text>
      <Text style={[styles.planDuration, isPopular && styles.popularTitle]}>
        /{duration}
      </Text>
    </View>
    <View style={[styles.selectButton, isPopular && styles.popularButton]}>
      <Text style={[styles.selectButtonText, isPopular && styles.popularButtonText]}>
        Select Plan
      </Text>
    </View>
  </TouchableOpacity>
);

export default function SubscriptionScreen() {
  const navigation = useNavigation<SubscriptionScreenNavigationProp>();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Premium Plans',
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

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    // Implement subscription logic
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary + '20', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <Crown size={40} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Unlock Premium Features</Text>
        <Text style={styles.headerSubtitle}>
          Get the most out of your dating experience
        </Text>
      </View>

      <View style={styles.features}>
        <PlanFeature
          icon={<Zap size={24} color={theme.colors.primary} />}
          title="See who likes you"
        />
        <PlanFeature
          icon={<Star size={24} color={theme.colors.primary} />}
          title="Priority in search results"
        />
        <PlanFeature
          icon={<CheckCircle2 size={24} color={theme.colors.primary} />}
          title="Verified badge"
        />
      </View>

      <View style={styles.plansContainer}>
        <SubscriptionPlan
          title="1 Month"
          price="$14.99"
          duration="month"
          onSelect={() => handleSelectPlan('monthly')}
        />
        <SubscriptionPlan
          title="6 Months"
          price="$9.99"
          duration="month"
          isPopular
          onSelect={() => handleSelectPlan('semi-annual')}
        />
        <SubscriptionPlan
          title="12 Months"
          price="$7.99"
          duration="month"
          onSelect={() => handleSelectPlan('annual')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Prices shown in USD. Subscriptions will auto-renew at the end of each term.
          You can cancel anytime.
        </Text>
        <TouchableOpacity>
          <Text style={styles.link}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
    width: width / 3.5,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  plansContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularPlan: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  planTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  popularTitle: {
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.lg,
  },
  planPrice: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  planDuration: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  selectButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
  },
  popularButton: {
    backgroundColor: 'white',
  },
  selectButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  popularButtonText: {
    color: theme.colors.primary,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  link: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});
