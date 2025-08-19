import { theme } from '../constants/theme';
import { Profile } from '../types/profile';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, GraduationCap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  isTopCard: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTopCard,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const cardWidth = screenWidth - 20;
    const tapZone = cardWidth / profile.images.length;
    const tappedIndex = Math.floor(locationX / tapZone);
    
    if (tappedIndex >= 0 && tappedIndex < profile.images.length) {
      setCurrentImageIndex(tappedIndex);
    }
  };
  const position = useRef(new Animated.ValueXY()).current;
  const rotateCard = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-screenHeight / 6, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard,
      onMoveShouldSetPanResponder: () => isTopCard,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          forceSwipe('up');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right' | 'up') => {
    const x = direction === 'right' ? screenWidth : direction === 'left' ? -screenWidth : 0;
    const y = direction === 'up' ? -screenHeight : 0;
    
    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      if (direction === 'left') onSwipeLeft();
      else if (direction === 'right') onSwipeRight();
      else if (direction === 'up') onSwipeUp();
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotateCard },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, animatedCardStyle]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={handleImageTap} activeOpacity={1} style={styles.imageContainer}>
        <Image source={{ uri: profile.images[currentImageIndex] }} style={styles.image} />
      </TouchableOpacity>
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.nameAge}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.age}>{profile.age}</Text>
        </View>
        
        {profile.occupation && (
          <View style={styles.infoRow}>
            <Briefcase size={16} color="white" />
            <Text style={styles.infoText}>{profile.occupation}</Text>
          </View>
        )}
        
        {profile.education && (
          <View style={styles.infoRow}>
            <GraduationCap size={16} color="white" />
            <Text style={styles.infoText}>{profile.education}</Text>
          </View>
        )}
        
        <Text style={styles.bio} numberOfLines={1}>{profile.bio}</Text>
        
        <View style={styles.interests}>
          {profile.interests.slice(0, 4).map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <Text style={styles.likeLabelText}>LIKE</Text>
      </Animated.View>
      
      <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
        <Text style={styles.nopeLabelText}>NOPE</Text>
      </Animated.View>
      
      <Animated.View style={[styles.superLikeLabel, { opacity: superLikeOpacity }]}>
        <Text style={styles.superLikeLabelText}>SUPER LIKE</Text>
      </Animated.View>
      
      <View style={styles.imageIndicators}>
        {profile.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentImageIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
      
      <View style={styles.premiumBanner}>
        <Text style={styles.premiumText}>Premium</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: screenWidth - 20,
    height: screenHeight * 0.75,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.cardBackground,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.xl,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.xl,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 55,
    padding: theme.spacing.lg,
  },
  nameAge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginRight: theme.spacing.sm,
  },
  age: {
    fontSize: theme.fontSize.xl,
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.sm,
  },
  bio: {
    color: 'white',
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  interestText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    borderWidth: 4,
    borderColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    transform: [{ rotate: '-30deg' }],
  },
  likeLabelText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    borderWidth: 4,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    transform: [{ rotate: '30deg' }],
  },
  nopeLabelText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  superLikeLabel: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  superLikeLabelText: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  premiumBanner: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  premiumText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
});


// No required code snippet
 {/* <View style={styles.infoRow}>
          <MapPin size={16} color="white" />
          <Text style={styles.infoText}>{profile.distance} miles away</Text>
        </View> */}