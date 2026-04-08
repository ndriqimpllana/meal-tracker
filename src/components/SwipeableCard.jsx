import { useRef } from 'react';
import { Animated, PanResponder, View, StyleSheet } from 'react-native';

const SWIPE_THRESHOLD = 80;

export default function SwipeableCard({ onSwipe, children, style }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          // Snap slightly further then spring back
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: g.dx > 0 ? 120 : -120,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 8,
            }),
          ]).start();
          onSwipe();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 10,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [-120, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, 120],
    outputRange: [0.4, 0.7, 1, 0.7, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <View style={s.container}>
      {/* Background hint */}
      <View style={s.swipeHint}>
        <Animated.Text style={[s.hintText, {
          opacity: translateX.interpolate({
            inputRange: [-120, -SWIPE_THRESHOLD, 0],
            outputRange: [1, 0.5, 0],
            extrapolate: 'clamp',
          }),
        }]}>← Remove</Animated.Text>
        <Animated.Text style={[s.hintText, {
          opacity: translateX.interpolate({
            inputRange: [0, SWIPE_THRESHOLD, 120],
            outputRange: [0, 0.5, 1],
            extrapolate: 'clamp',
          }),
        }]}>Remove →</Animated.Text>
      </View>

      <Animated.View
        style={[style, { transform: [{ translateX }], opacity }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'relative',
  },
  swipeHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#f8717133',
  },
  hintText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#f87171',
  },
});
