import { useRef } from 'react';
import { Animated, PanResponder, View, Text, StyleSheet } from 'react-native';

const SWIPE_THRESHOLD = 80;
const RADIUS = 18;

export default function SwipeableCard({ onSwipe, children, style }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => translateX.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          Animated.sequence([
            Animated.timing(translateX, { toValue: g.dx > 0 ? 120 : -120, duration: 100, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
          ]).start();
          onSwipe();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 10 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [-120, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, 120],
    outputRange: [0.4, 0.75, 1, 0.75, 0.4],
    extrapolate: 'clamp',
  });

  const hintOpacityL = translateX.interpolate({
    inputRange: [-120, -SWIPE_THRESHOLD, 0], outputRange: [1, 0.4, 0], extrapolate: 'clamp',
  });
  const hintOpacityR = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, 120], outputRange: [0, 0.4, 1], extrapolate: 'clamp',
  });

  return (
    <View style={[s.outer, { borderRadius: RADIUS }]}>
      {/* Remove hint layer */}
      <View style={s.hint}>
        <Animated.Text style={[s.hintText, { opacity: hintOpacityL }]}>← Remove</Animated.Text>
        <Animated.Text style={[s.hintText, { opacity: hintOpacityR }]}>Remove →</Animated.Text>
      </View>

      <Animated.View
        style={[style, { borderRadius: RADIUS, transform: [{ translateX }], opacity }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#fee2e2',
    borderRadius: RADIUS,
  },
  hintText: { fontSize: 11, fontWeight: '700', color: '#ef4444', letterSpacing: 0.5 },
});
