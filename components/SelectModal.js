import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "./Toast";

const SelectModelDialog = ({
  visible,
  onClose,
  onSelectModel,
  setCustomerList,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customerList, setCustomerListState] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  // Fetch customer details when modal becomes visible
  useEffect(() => {
    if (visible) {
      const fetchCustomerDetails = async () => {
        try {
          const data = await AsyncStorage.getItem("customerDetails");
          if (data) {
            const customerData = JSON.parse(data);
            setCustomerListState(customerData);
            setSearchResults(customerData);
          } else {
            setCustomerListState([]);
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Error fetching customer data", error);
        }
      };

      fetchCustomerDetails();
    }
  }, [visible]);

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      // Filter the search results based on the query
      const filteredResults = customerList.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      // Reset to initial data if query is empty
      setSearchResults(customerList);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (id) => {
    Alert.alert("Delete Customer", "Are you sure you want to delete this customer permanently ?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedCustomers = customerList.filter(
              (customer) => customer.id !== id
            );
            setCustomerListState(updatedCustomers);
            setSearchResults(updatedCustomers);
            setCustomerList(updatedCustomers);
            setToast({
              visible: true,
              message: "Record deleted successfully!",
              type: "success",
            });

            await AsyncStorage.setItem(
              "customerDetails",
              JSON.stringify(updatedCustomers)
            );
          } catch (error) {
            setToast({
              visible: true,
              message: "Failed to delete record!",
              type: "error",
            });
            console.error("Error deleting customer data", error);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.dialogBox}>
          {/* Modal Header */}
          <Text style={styles.dialogTitle}>Select Customer Model</Text>

          {/* Search Input */}
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
            placeholder="Search Customer."
          />

          {/* Search Results */}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <TouchableOpacity
                  style={styles.resultInfo}
                  onPress={() => {
                    onSelectModel(item);
                    onClose();
                  }}
                >
                  <Text style={styles.resultText}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#D3D3D3",
                    padding: 2,
                    borderRadius: 30,
                  }}
                  onPress={() => handleDeleteCustomer(item.id)}
                >
                 <MaterialIcons name="close" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast message={toast.message} visible={toast?.visible} type={toast.type} onClose={() => setToast({visible: false})} />

    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialogBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  searchInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  resultItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius:15,
    marginTop:5,
    marginBottom:5,
   
    boxShadow:' 0 0 5px rgba(0, 0, 0, 0.2)'
  },
  resultInfo: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#DE3163",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default SelectModelDialog;
