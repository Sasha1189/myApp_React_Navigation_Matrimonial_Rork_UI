import React, { useCallback, useEffect } from "react";
import { Dimensions, View, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Profile } from "@/features/profile/types/profile";
import { FeedHookResult } from "../type/type";
import { SwipeCard } from "./SwipeCard";
import { FeedStatusCard } from "./FeedStatusCard";
import { FeedStatusContent } from "./FeedStatusContent";

interface VerticalSwipeListProps {
  feed: FeedHookResult;
}

export function VerticalSwipeList({ feed }: VerticalSwipeListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { height: screenHeight } = Dimensions.get("screen");

  const FIXED_HEADER = 60 + insets.top;
  const FIXED_TABBAR = 50 + insets.bottom;
  const availableHeight = screenHeight - FIXED_HEADER - FIXED_TABBAR;

  const _spacing = 12;
  const _itemSize = availableHeight * 0.86;
  const _itemFullSize = _itemSize + _spacing;

  const {
    profiles,
    currentIndex,
    updateIndex,
    isLoading,
    isLoadingMore,
    hasMore,
    isError,
  } = feed;

  const scrollY = useSharedValue(currentIndex);

  useEffect(() => {
    scrollY.value = currentIndex;
  }, [currentIndex, scrollY]);

  const handleScrollEnd = useCallback(
    (offsetY: number) => {
      const activeIndex = Math.round(offsetY / _itemFullSize);
      if (
        activeIndex !== currentIndex &&
        activeIndex >= 0 &&
        activeIndex < profiles.length
      ) {
        updateIndex(activeIndex);
      }
    },
    [feed, _itemFullSize, profiles],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event: any) => {
      scrollY.value = event.contentOffset.y / _itemFullSize;
    },
    onMomentumEnd: (event: any) => {
      runOnJS(handleScrollEnd)(event.contentOffset.y);
    },
  });

  // 3. Stable renderItem callback
  const renderItem = useCallback(
    ({ item, index }: { item: Profile; index: number }) => (
      <SwipeCard
        profile={item}
        index={index}
        scrollY={scrollY}
        itemFullSize={_itemFullSize}
        itemSize={_itemSize}
        spacing={_spacing}
      />
    ),
    [scrollY, _itemFullSize, _itemSize, _spacing],
  );

  // 4. Stable item key extractor
  const keyExtractor = useCallback(
    (item: Profile, index: number) => item?.uid ?? `profile-${index}`,
    [],
  );

  // 5. Stable Item Layout calculation
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: _itemFullSize,
      offset: _itemFullSize * index,
      index,
    }),
    [_itemFullSize],
  );

  // 6. Pagination Trigger with safer threshold
  const handleEndReached = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    feed.loadMore?.();
  }, [isLoading, feed]);

  // 7. Retry handler for layout measuring delays
  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    console.warn(
      `[VerticalSwipeList] Scroll to index ${info.index} failed. Retrying...`,
    );
  }, []);

  // 8. Memoized Item Separator
  const renderSeparator = useCallback(
    () => <View style={{ height: _spacing }} />,
    [_spacing],
  );

  // 9. Memoized List Footer
  const renderFooter = useCallback(
    () => (
      <View style={{ paddingTop: _spacing * 3 }}>
        <View style={{ height: _itemSize, justifyContent: "center" }}>
          <FeedStatusContent feed={feed} isFooter={true} itemSize={_itemSize} />
        </View>
      </View>
    ),
    [feed, _itemSize, _spacing],
  );

  if (isLoading && profiles?.length === 0) {
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

  if (profiles?.length === 0 || isError) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: FIXED_HEADER + _spacing,
          alignItems: "center",
        }}
      >
        <View style={{ height: _itemSize, width: "100%" }}>
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
      data={profiles}
      initialScrollIndex={currentIndex}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: FIXED_HEADER + _spacing,
        paddingBottom: FIXED_TABBAR + (availableHeight - _itemFullSize),
      }}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      removeClippedSubviews={Platform.OS === "android"}
      snapToInterval={_itemFullSize}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={handleEndReached}
      onEndReachedThreshold={1.0}
      // 1. Prevents fast flicks from flinging past the next card/footer
      disableIntervalMomentum={true}
      // 2. Prevents rubber-banding past the end edge into white background
      bounces={false}
      overScrollMode="never"
      ListFooterComponent={renderFooter}
    />
  );
}
