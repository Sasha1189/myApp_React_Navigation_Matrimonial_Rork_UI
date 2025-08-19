import { theme } from '../../../theme/index';
import { LinearGradient } from 'expo-linear-gradient';
// import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Crown,
  Eye,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  discount?: string;
  popular?: boolean;
  features: PlanFeature[];
}

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      period: 'Forever',
      features: [
        { text: 'Create profile', included: true },
        { text: 'Browse profiles', included: true },
        { text: 'Limited likes per day', included: true },
        { text: 'Basic matching', included: true },
        { text: 'See who liked you', included: false },
        { text: 'Unlimited likes', included: false },
        { text: 'Super likes', included: false },
        { text: 'Boost profile', included: false },
        { text: 'Advanced filters', included: false },
        { text: 'Read receipts', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹999',
      period: 'per month',
      originalPrice: '₹1,299',
      discount: '23% OFF',
      popular: true,
      features: [
        { text: 'Everything in Basic', included: true },
        { text: 'See who liked you', included: true },
        { text: 'Unlimited likes', included: true },
        { text: '5 Super likes per day', included: true },
        { text: '1 Boost per month', included: true },
        { text: 'Advanced filters', included: true },
        { text: 'Read receipts', included: true },
        { text: 'Priority support', included: true },
        { text: 'Ad-free experience', included: true },
        { text: 'Incognito mode', included: false },
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: '₹1,499',
      period: 'per month',
      originalPrice: '₹1,999',
      discount: '25% OFF',
      features: [
        { text: 'Everything in Premium', included: true },
        { text: 'Unlimited Super likes', included: true },
        { text: '5 Boosts per month', included: true },
        { text: 'Incognito mode', included: true },
        { text: 'Message before matching', included: true },
        { text: 'Priority in search results', included: true },
        { text: 'Exclusive badges', included: true },
        { text: 'VIP customer support', included: true },
        { text: 'Profile verification', included: true },
        { text: 'Travel mode', included: true },
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan?.price === 'Free') {
      Alert.alert('Already Active', 'You are already using the Basic plan!');
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${plan?.name} plan for ${plan?.price} ${plan?.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: () => {
            Alert.alert('Success', 'Subscription activated successfully!');
          }
        },
      ]
    );
  };

  const renderPlan = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const isFree = plan.price === 'Free';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlan,
          plan.popular && styles.popularPlan,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Star size={16} color="white" fill="white" />
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{plan.discount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{plan.price}</Text>
            {!isFree && (
              <Text style={styles.period}>{plan.period}</Text>
            )}
            {plan.originalPrice && (
              <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
            )}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[
                styles.featureIcon,
                feature.included ? styles.includedIcon : styles.excludedIcon,
              ]}>
                <Check 
                  size={16} 
                  color={feature.included ? theme.colors.success : theme.colors.textLight} 
                />
              </View>
              <Text style={[
                styles.featureText,
                !feature.included && styles.excludedText,
              ]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerShown: true,
          title: 'Subscription Plans',
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
            <Crown size={32} color={theme.colors.warning} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Upgrade Your Experience</Text>
              <Text style={styles.headerText}>
                Get more matches, better visibility, and exclusive features.
              </Text>
            </View>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why upgrade?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Zap size={20} color={theme.colors.accent} />
                <Text style={styles.benefitText}>Get 3x more matches</Text>
              </View>
              <View style={styles.benefitItem}>
                <Eye size={20} color={theme.colors.accent} />
                <Text style={styles.benefitText}>See who likes you</Text>
              </View>
              <View style={styles.benefitItem}>
                <Heart size={20} color={theme.colors.accent} />
                <Text style={styles.benefitText}>Unlimited likes</Text>
              </View>
              <View style={styles.benefitItem}>
                <MessageCircle size={20} color={theme.colors.accent} />
                <Text style={styles.benefitText}>Message anyone</Text>
              </View>
            </View>
          </View>

          <View style={styles.plansContainer}>
            {plans.map(renderPlan)}
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              selectedPlan === 'basic' && styles.disabledButton,
            ]}
            onPress={handleSubscribe}
            disabled={selectedPlan === 'basic'}
          >
            <LinearGradient
              colors={
                selectedPlan === 'basic' 
                  ? [theme.colors.textLight, theme.colors.textLight]
                  : [theme.colors.primary, theme.colors.primaryDark]
              }
              style={styles.subscribeGradient}
            >
              <Sparkles size={20} color="white" />
              <Text style={styles.subscribeText}>
                {selectedPlan === 'basic' ? 'Current Plan' : 'Subscribe Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.guaranteeCard}>
            <Shield size={24} color={theme.colors.success} />
            <View style={styles.guaranteeContent}>
              <Text style={styles.guaranteeTitle}>30-Day Money Back Guarantee</Text>
              <Text style={styles.guaranteeText}>
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </Text>
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
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitsList: {
    gap: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  plansContainer: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlan: {
    borderColor: theme.colors.primary,
  },
  popularPlan: {
    borderColor: theme.colors.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  planHeader: {
    marginBottom: theme.spacing.lg,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  planName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  discountBadge: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  discountText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  period: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.sm,
  },
  featuresContainer: {
    gap: theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  includedIcon: {
    backgroundColor: theme.colors.success + '20',
  },
  excludedIcon: {
    backgroundColor: theme.colors.textLight + '20',
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
  },
  excludedText: {
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
  },
  subscribeButton: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  subscribeText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  guaranteeCard: {
    backgroundColor: theme.colors.success + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
  },
  guaranteeContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  guaranteeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  guaranteeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
});