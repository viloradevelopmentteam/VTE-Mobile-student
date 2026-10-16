import { GraduationCap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  View,
  type ImageSourcePropType,
} from 'react-native';

const VTE_LOGO: ImageSourcePropType = require('@/assets/educationLogo/VTE3.png');

const DOODLE_PATTERN: ImageSourcePropType = require('@/assets/background/BackgroundPattern.png');

type ViloratechSplashProps = {
  onFinished?: () => void;
  duration?: number;
  logoSource?: ImageSourcePropType;
};

export function ViloratechSplash({
  onFinished,
  duration = 5000,
  logoSource = VTE_LOGO,
}: ViloratechSplashProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasFinishedRef = useRef(false);

  const patternOpacity = useRef(new Animated.Value(0)).current;
  const patternDriftX = useRef(new Animated.Value(0)).current;
  const patternDriftY = useRef(new Animated.Value(0)).current;

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(1)).current;

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(10)).current;

  const finalZoom = useRef(new Animated.Value(1)).current;
  const finalFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const finishOnce = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      onFinished?.();
    };

    const intro = Animated.sequence([
      Animated.timing(patternOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);
    intro.start();

    const driftLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(patternDriftX, {
            toValue: -24,
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(patternDriftX, {
            toValue: 0,
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(patternDriftY, {
            toValue: -18,
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(patternDriftY, {
            toValue: 0,
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    driftLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.35,
          duration: 1,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.5,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseStartTimer = setTimeout(() => pulseLoop.start(), 1000);

    const exitDelay = Math.max(duration - 500, 0);
    const exitTimer = setTimeout(() => {
      pulseLoop.stop();
      driftLoop.stop();
      Animated.parallel([
        Animated.timing(finalZoom, {
          toValue: 1.15,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(finalFade, {
          toValue: 0,
          duration: 400,
          delay: 100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, exitDelay);

    const holdTimer = setTimeout(finishOnce, duration);

    return () => {
      clearTimeout(pulseStartTimer);
      clearTimeout(exitTimer);
      clearTimeout(holdTimer);
      pulseLoop.stop();
      driftLoop.stop();
      intro.stop();
    };
  }, [duration, onFinished]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{ opacity: finalFade, transform: [{ scale: finalZoom }] }}
      className="flex-1 bg-backgroundPrimary"
    >
     
      <Animated.View
        pointerEvents="none"
        style={{
          opacity: patternOpacity,
          transform: [
            { translateX: patternDriftX },
            { translateY: patternDriftY },
          ],
        }}
        className="absolute -inset-6"
      >
        <ImageBackground
          source={DOODLE_PATTERN}
          resizeMode="repeat"
          style={{ flex: 1, opacity: 0.06 }}
        />
      </Animated.View>

      <View className="flex-1 items-center justify-center px-6">
        {/* <Animated.View
          pointerEvents="none"
          style={{
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
          className="absolute h-36 w-36 rounded-full border-2 border-primary"
        />
      */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: rotateInterpolate },
            ],
          }}
          className="  h-32 w-32 mt-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md "
        >
          {imageFailed ? (
            <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <GraduationCap size={30} color="#bb1f2d" strokeWidth={1.5} />
            </View>
          ) : (
            <Image
              source={logoSource}
              className="ml-2"
              resizeMode="contain"
              style={{ width: 120, height: 120, borderRadius: 46 }}
              onError={(e) => {
                console.warn('Splash logo failed to load:', e.nativeEvent?.error);
                setImageFailed(true);
              }}
            />
          )}
        </Animated.View>

        <Animated.Text
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslate }],
          }}
          className="mt-8 text-center text-xs tracking-[5px] text-black"
        >
          LEARN · EXPLORE · ACHIEVE
        </Animated.Text>
      </View>
    </Animated.View>
  );
}