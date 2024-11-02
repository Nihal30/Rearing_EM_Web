import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "./Toast";

const BottomSheetModal = ({
  visible,
  onClose,
  headerText,
  setCustomerDetails,
  updateCustomer,
  setCustomerList
}) => {
  // State for customer details
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const isUpdate = updateCustomer !== null;
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  // Reset input fields
  const resetFields = () => {
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPhoneError(false);
  };

  // Effect to set initial customer data when updating
  useEffect(() => {
    if (isUpdate && updateCustomer) {
      setCustomerId(updateCustomer.id);
      setCustomerName(updateCustomer.name);
      setCustomerPhone(updateCustomer.phone);
      setCustomerAddress(updateCustomer.address);
    } else {
      resetFields();
    }
  }, [isUpdate, updateCustomer]);

  // Handler for the "Add/Update" button
  const handleAddOrUpdateDetails = async () => {
    if (customerName.trim() === '' || customerPhone.trim() === '') {
      Alert.alert('Error', 'Name and Phone Number are required fields.');
      return;
    }

    if (customerPhone.length !== 10) {
      setPhoneError(true);
      return;
    }

    const newCustomer = {
      id: isUpdate ? customerId : `${Date.now()}`, // Unique ID for new customer
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
    };

    try {
      const existingData = await AsyncStorage.getItem('customerDetails');
      let existingCustomers = existingData ? JSON.parse(existingData) : [];

      if (isUpdate) {
        // Update existing customer by matching ID
        existingCustomers = existingCustomers.map((customer) =>
          customer.id === customerId ? newCustomer : customer
        );
        setCustomerList(existingCustomers)
      } else {
        // Add new customer
        existingCustomers.push(newCustomer);
      }

      setCustomerDetails(existingCustomers);
      await AsyncStorage.setItem(
        'customerDetails',
        JSON.stringify(existingCustomers)
      );

      setToast({
        visible: true,
        message: isUpdate ? 'Customer updated successfully!' : 'Customer added successfully!',
        type: 'success',
      });

      resetFields();
      onClose();

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setToast({ visible: false, message: '', type: '' });
      }, 1000);
    } catch (error) {
      console.error('Error saving customer data', error);
      setToast({
        visible: true,
        message: 'Failed to save customer data!',
        type: 'error',
      });

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setToast({ visible: false, message: '', type: '' });
      }, 3000);
    }
  };




  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{headerText}</Text>
          </View>

          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.input}
            placeholder="Customer Name"
          />
          <TextInput
            value={customerPhone}
            onChangeText={(text) => {
              setCustomerPhone(text);
              if (text.length === 10) {
                setPhoneError(false);
              }
            }}
            style={[styles.input, phoneError && styles.errorInput]}
            placeholder="Customer Phone No"
            keyboardType="phone-pad"
            // editable={!isUpdate} // Disable phone number edit in update mode
          />
          {phoneError && (
            <Text style={{ marginTop: -10, marginBottom: 10, color: "red" }}>
              Add 10 digits number
            </Text>
          )}
          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            style={styles.input}
            placeholder="Customer Address"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddOrUpdateDetails}
          >
            <Text style={styles.buttonText}>{isUpdate ? "Update" : "Add"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Toast message={toast.message} visible={toast?.visible} type={toast.type} onClose={() => setToastVisible(false)}/>

    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    maxHeight: "50%",
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  errorInput: {
    borderColor: "red",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#DE3163",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
  },
});

export default BottomSheetModal;
