import React from "react";
import { Dimensions, Platform, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { height: screenHeight } = Dimensions.get("screen");

  const FIXED_HEADER = 60 + insets.top;
  const FIXED_TABBAR = 50 + insets.bottom;

  const availableHeight = screenHeight - FIXED_HEADER - FIXED_TABBAR;

  const _spacing = 12;

  const _itemSize = availableHeight * 0.86;

  const _itemFullSize = _itemSize + _spacing;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y / _itemFullSize;
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
            title="Loading..."
            message="Finding profiles near you"
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
    />
  );
}
