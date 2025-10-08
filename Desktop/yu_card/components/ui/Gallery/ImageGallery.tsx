import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.8;

interface ImageGalleryProps {
  images: string[];
  fallbackImage?: string;
}

export function ImageGallery({ images, fallbackImage }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const displayImages = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  if (displayImages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color={Colors.gray[300]} />
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / IMAGE_WIDTH);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * IMAGE_WIDTH,
      animated: true,
    });
    setActiveIndex(index);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Main Image Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {displayImages.map((imageUrl, index) => (
            <Pressable
              key={`${imageUrl}-${index}`}
              onPress={() => setFullscreenVisible(true)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        {displayImages.length > 1 && (
          <View style={styles.paginationContainer}>
            {displayImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToIndex(index)}
                style={[
                  styles.dot,
                  activeIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <View style={styles.counterBadge}>
            <Ionicons name="images" size={14} color={Colors.black} />
            <View style={styles.counterText}>
              <Ionicons name="chevron-forward" size={10} color={Colors.black} />
            </View>
          </View>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullscreenVisible(false)}
          >
            <Ionicons name="close" size={32} color={Colors.white} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.fullscreenScrollView}
          >
            {displayImages.map((imageUrl, index) => (
              <View key={`fullscreen-${index}`} style={styles.fullscreenImageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.fullscreenImage}
                  contentFit="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    position: 'relative',
  },

  scrollView: {
    width: IMAGE_WIDTH,
  },

  scrollContent: {
    alignItems: 'center',
  },

  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  emptyContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
  },

  paginationContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },

  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },

  counterBadge: {
    position: 'absolute',
    top: Spacing.lg + Spacing.sm,
    right: (SCREEN_WIDTH - IMAGE_WIDTH) / 2 + Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  counterText: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Fullscreen Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },

  fullscreenScrollView: {
    flex: 1,
  },

  fullscreenImageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});
