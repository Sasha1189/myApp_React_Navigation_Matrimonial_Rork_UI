import { theme } from '../../../theme/index';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Edit3,
  Image as ImageIcon,
  Plus,
  Star,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppStackParamList } from '../../../navigation/types';

const { width } = Dimensions.get('window');
const photoSize = (width - theme.spacing.lg * 3) / 2;

interface Photo {
  id: string;
  uri: string;
  isPrimary: boolean;
}

type ManagePhotosScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ManagePhotos'>;

export default function ManagePhotosScreen() {
  const navigation = useNavigation<ManagePhotosScreenNavigationProp>();
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
      isPrimary: true,
    },
    {
      id: '2',
      uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face',
      isPrimary: false,
    },
    {
      id: '3',
      uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
      isPrimary: false,
    },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Manage Photos',
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

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
          },
        },
      ]
    );
  };

  const handleSetPrimary = (photoId: string) => {
    setPhotos(prev =>
      prev.map(photo => ({
        ...photo,
        isPrimary: photo.id === photoId,
      }))
    );
  };

  const renderPhotoSlot = (photo?: Photo, index?: number) => {
    if (!photo) {
      return (
        <TouchableOpacity
          key={`empty-${index}`}
          style={styles.emptyPhotoSlot}
          onPress={handleAddPhoto}
        >
          <Plus size={32} color={theme.colors.textLight} />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View key={photo.id} style={styles.photoContainer}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        {photo.isPrimary && (
          <View style={styles.primaryBadge}>
            <Star size={16} color="white" fill="white" />
            <Text style={styles.primaryText}>Primary</Text>
          </View>
        )}
        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetPrimary(photo.id)}
          >
            <Star
              size={20}
              color={photo.isPrimary ? theme.colors.warning : 'white'}
              fill={photo.isPrimary ? theme.colors.warning : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePhoto(photo.id)}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const maxPhotos = 6;
  const emptySlots = Math.max(0, maxPhotos - photos.length);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary + '20', 'transparent']}
        style={styles.headerGradient}
      />
      
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <ImageIcon size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Photo Guidelines</Text>
            <Text style={styles.infoText}>
              • Upload up to {maxPhotos} high-quality photos{"\n"}
              • First photo will be your primary photo{"\n"}
              • Clear face photos get more matches{"\n"}
              • Avoid group photos or sunglasses
            </Text>
          </View>
        </View>

        <View style={styles.photosGrid}>
          {photos.map(photo => renderPhotoSlot(photo))}
          {Array.from({ length: emptySlots }, (_, index) =>
            renderPhotoSlot(undefined, index)
          )}
        </View>

        <View style={styles.tipCard}>
          <Edit3 size={20} color={theme.colors.accent} />
          <Text style={styles.tipText}>
            Tap the star to set a photo as primary. Tap the X to delete a photo.
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
  infoCard: {
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
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  photo: {
    width: photoSize,
    height: photoSize * 1.3,
    borderRadius: theme.borderRadius.lg,
  },
  emptyPhotoSlot: {
    width: photoSize,
    height: photoSize * 1.3,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  addPhotoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  primaryBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  photoActions: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
  },
  tipCard: {
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    lineHeight: 20,
  },
});
