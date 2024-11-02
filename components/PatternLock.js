import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 20;

const PatternLock = ({ visible, onClose, pattern = [], setPattern }) => {
  const fadeAnims = useRef(Array(9).fill().map(() => new Animated.Value(0))).current;
  const [wasVisible, setWasVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      if (pattern.length > 0) {
        animatePattern(); // Animate if there is a pattern
      } else {
        fadeAnims.forEach((anim) => anim.setValue(0)); // Reset animations if no pattern
      }
      setWasVisible(true); // Mark that modal was visible
    } else if (wasVisible) {
      setWasVisible(false); // Reset wasVisible when modal is closed
      // Reset animation values when the modal closes
      fadeAnims.forEach((anim) => anim.setValue(0));
    }
  }, [visible, pattern]);

  const animatePattern = () => {
    console.log("Animating pattern:", pattern);

    // Reset animations first to ensure a fresh start
    fadeAnims.forEach((anim) => anim.setValue(0));

    // Trigger staggered animations for each item in the pattern
    const animations = pattern.map((index, i) =>
      Animated.timing(fadeAnims[index], {
        toValue: 1,
        duration: 300,
        delay: i * 200, // Stagger delay to control order
        useNativeDriver: false,
      })
    );

    // Start the animations in staggered sequence
    Animated.stagger(200, animations).start(() => {
      console.log("Animation complete");
    });
  };

  const handleCirclePress = (index) => {
    if (!pattern.includes(index)) {
      setPattern([...pattern, index]);
    }
  };

  const handleReset = () => {
    setPattern([]);
    fadeAnims.forEach((anim) => anim.setValue(0)); // Reset animation
  };

  const handleSubmit = () => {
    if (pattern.length < 3) {
      Alert.alert('Error', 'Please enter at least 3 values in the pattern.');
    } else {
      Alert.alert('Pattern Entered', `Your pattern is: ${pattern.join('-')}`);
      onClose();
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.patternContainer}>
          {[...Array(9)].map((_, index) => {
            const animatedStyle = {
              opacity: fadeAnims[index],
              transform: [
                {
                  scale: fadeAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
            };

            // Determine the color based on selection
            const circleColor = pattern.includes(index) ? '#7393B3' : '#D3D3D3';

            return (
              <TouchableOpacity
                key={index}
                style={[styles.circle, { backgroundColor: circleColor }]}
                onPress={() => handleCirclePress(index)}
              >
                <Animated.View
                  style={[styles.animatedCircle, animatedStyle]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    backgroundColor: 'white',
  },
  patternContainer: {
    width: width -100,
    height: width - 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    margin: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    backgroundColor: '#DE3163', // Add background color for visibility
    borderWidth: 2,
    borderColor: '#DE3163',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    padding: 10,
    backgroundColor: '#DE3163',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PatternLock;
