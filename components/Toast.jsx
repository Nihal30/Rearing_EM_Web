import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Toast = ({ message, visible, type, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose(); // Call the onClose function after 3 seconds
      }, 3000);
      return () => clearTimeout(timer); // Clear timeout if the component unmounts or visibility changes
    }
  }, [visible]);

  if (!visible) return null; // Return null if not visible

  return (
    <View style={styles.toast}>
      <Text style={[styles.toastText, type === 'success' ? styles.successText : styles.errorText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -150 }],
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
    width: '80%',
    backgroundColor: '#ffffff',
  },
  toastText: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
});

export default Toast;
