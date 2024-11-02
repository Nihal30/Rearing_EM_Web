import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FormDataContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState([]);

  // Load data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('formData');
        if (storedData) {
          console.log('Stored Data:', JSON.parse(storedData));
          setFormData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Failed to load data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  // Function to save data to AsyncStorage
  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('formData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to AsyncStorage:', error);
    }
  };

  // Function to add new data
  const addData = async (newData) => {
    const updatedData = [...formData, newData];
    setFormData(updatedData);
    await saveData(updatedData);
  };

  // Function to update existing data
  const updateData = async (id, updatedData) => {
    const newData = formData.map(item => (item.id === id ? { ...item, ...updatedData } : item));
    setFormData(newData);
    await saveData(newData);
  };

  // Function to delete data
  const deleteData = async (id) => {
    const newData = formData.filter(item => item.id !== id);
    setFormData(newData);
    await saveData(newData);
  };

  return (
    <FormDataContext.Provider value={{ formData, addData, updateData, deleteData }}>
      {children}
    </FormDataContext.Provider>
  );
};
