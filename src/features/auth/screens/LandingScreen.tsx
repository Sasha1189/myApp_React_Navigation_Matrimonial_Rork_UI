import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthNavigation } from '../../../navigation/hooks';
import { Heart, Sparkles, Users } from 'lucide-react-native';
import { theme } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useAuthNavigation();
  const handleGetStarted = () => {
    navigation.navigate("PhoneSignIn");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Heart size={40} color={theme.colors.accent} fill={theme.colors.accent} />
                <Text style={styles.appName}>LoveConnect</Text>
              </View>
              <Text style={styles.tagline}>Find Your Perfect Match</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Sparkles size={24} color="white" />
                <Text style={styles.featureText}>Smart Matching</Text>
              </View>
              <View style={styles.feature}>
                <Users size={24} color="white" />
                <Text style={styles.featureText}>Verified Profiles</Text>
              </View>
              <View style={styles.feature}>
                <Heart size={24} color="white" />
                <Text style={styles.featureText}>Meaningful Connections</Text>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
              
              <Text style={styles.termsText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.fontSize.xxl + 8,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresContainer: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: width * 0.6,
    justifyContent: 'center',
  },
  featureText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  getStartedButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md + 4,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.lg,
    minWidth: width * 0.7,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  termsText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});