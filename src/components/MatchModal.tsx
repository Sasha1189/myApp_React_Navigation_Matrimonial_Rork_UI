import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, X } from 'lucide-react-native';
import { Profile } from '../types/profile';
import { theme } from '../constants/theme';

interface MatchModalProps {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
  onMessage: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  profile,
  onClose,
  onMessage,
}) => {
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.gradient}
          />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.subtitle}>
            You and {profile.name} liked each other
          </Text>
          
          <View style={styles.imagesContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
              style={styles.userImage}
            />
            <View style={styles.heartContainer}>
              <Text style={styles.heart}>💕</Text>
            </View>
            <Image
              source={{ uri: profile.images[0] }}
              style={styles.matchImage}
            />
          </View>
          
          <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
            <MessageCircle size={20} color="white" />
            <Text style={styles.messageButtonText}>Send a Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.keepSwipingText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xl,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  matchImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  heartContainer: {
    marginHorizontal: -10,
    zIndex: 1,
  },
  heart: {
    fontSize: 40,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.md,
  },
  messageButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  keepSwipingText: {
    fontSize: theme.fontSize.md,
    color: 'white',
    fontWeight: '600',
  },
});