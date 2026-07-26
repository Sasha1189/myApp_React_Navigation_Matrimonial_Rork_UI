import React, { useRef } from "react";
import { Dimensions, View, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Profile } from "../../../types/profile";
import { SwipeCard } from "./SwipeCard";
import { FeedStatusCard } from "./FeedStatusCard";
import { FeedStatusContent } from "./FeedStatusContent";

interface VerticalSwipeListProps {
  profiles: Profile[];
  isLoading: boolean;
  feed: any;
}

export function VerticalSwipeList({
  profiles,
  isLoading,
  feed,
}: VerticalSwipeListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const { height: screenHeight } = Dimensions.get("screen");

  const FIXED_HEADER = 60 + insets.top;
  const FIXED_TABBAR = 50 + insets.bottom;

  const availableHeight = screenHeight - FIXED_HEADER - FIXED_TABBAR;

  const _spacing = 12;

  const _itemSize = availableHeight * 0.86;

  const _itemFullSize = _itemSize + _spacing;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event: any) => {
      scrollY.value = event.contentOffset.y / _itemFullSize;
    },
    onMomentumEnd: (event: any) => {
      const activeIndex = Math.round(event.contentOffset.y / _itemFullSize);

      if (activeIndex !== feed.currentIndex && activeIndex < profiles.length) {
        runOnJS(feed.updateIndex)(activeIndex);
      }
    },
  });

  // 1. PLACE THE LOADING SKELETON EXACTLY IN THE ACTIVE CARD AREA
  if (isLoading && profiles.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: FIXED_HEADER + _spacing,
          alignItems: "center",
        }}
      >
        <View style={{ height: _itemSize, width: "100%" }}>
          <FeedStatusCard
            type="loading"
            title={t("feed.loadingTitle")}
            message={t("feed.loadingMessage")}
            itemSize={_itemSize}
          />
        </View>
      </View>
    );
  }

  // 2. Error or Full-Screen Empty State Overlays (When array length is genuinely 0)
  if (profiles.length === 0 || feed.isError) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: FIXED_HEADER + _spacing,
          alignItems: "center",
        }}
      >
        <View style={{ height: _itemSize, width: "100%" }}>
          {/* Passes isFooter=false by default for full-screen states */}
          <FeedStatusContent
            feed={feed}
            isFooter={false}
            itemSize={_itemSize}
          />
        </View>
      </View>
    );
  }

  return (
    <Animated.FlatList
      ref={flatListRef}
      data={profiles}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: FIXED_HEADER + _spacing,
        paddingBottom: FIXED_TABBAR + (availableHeight - _itemFullSize),
      }}
      renderItem={({ item, index }) => (
        <SwipeCard
          profile={item}
          index={index}
          scrollY={scrollY}
          itemFullSize={_itemFullSize}
          itemSize={_itemSize}
          spacing={_spacing}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: _spacing }} />}
      keyExtractor={(item) => item.uid}
      initialScrollIndex={
        profiles.length > 0 &&
        feed.currentIndex > 0 &&
        feed.currentIndex < profiles.length
          ? feed.currentIndex
          : undefined
      }
      getItemLayout={(_, index) => ({
        length: _itemFullSize,
        offset: _itemFullSize * index,
        index,
      })}
      initialNumToRender={5}
      maxToRenderPerBatch={3}
      windowSize={7}
      removeClippedSubviews={Platform.OS === "android"}
      snapToInterval={_itemFullSize}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => (
        <View style={{ height: _itemSize, justifyContent: "center" }}>
          <FeedStatusContent feed={feed} isFooter={true} itemSize={_itemSize} />
        </View>
      )}
      onScrollToIndexFailed={(info) => {
        // Safe guard fallback if layout pipelines glitch out during memory sweeps
        const targetOffset = info.index * _itemFullSize;
        flatListRef.current?.scrollToOffset({
          offset: targetOffset,
          animated: false,
        });
      }}
    />
  );
}
