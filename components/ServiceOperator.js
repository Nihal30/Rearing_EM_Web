import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const ServiceOperator = ({ visible, onClose }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [operators, setOperators] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("operators");
      if (storedData !== null) {
        setOperators(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const saveData = async (newData) => {
    try {
      await AsyncStorage.setItem("operators", JSON.stringify(newData));
    } catch (error) {
      console.error("Failed to save data", error);
    }
  };

  const handleSubmit = () => {
    let valid = true;

    if (!name) {
      setNameError("Name is required");
      valid = false;
    } else {
      setNameError("");
    }

    if (!contact) {
      setContactError("Contact is required");
      valid = false;
    } else if (contact.length !== 10) {
      setContactError("Contact must be 10 digits");
      valid = false;
    } else {
      setContactError("");
    }

    if (valid) {
      const uniqueId = `${Date.now()}-${operators.length + 1}`;

      const newOperator = {
        id: isEdit ? currentId : uniqueId,
        name,
        contact,
        address,
      };

      let updatedOperators;
      if (isEdit) {
        updatedOperators = operators.map((op) =>
          op.id === currentId ? newOperator : op
        );
        setIsEdit(false);
      } else {
        updatedOperators = [...operators, newOperator];
      }

      setOperators(updatedOperators);
      saveData(updatedOperators);

      // Reset form
      reset();
    }
  };

  const reset = () => {
    setName("");
    setContact("");
    setAddress("");
    setIsEdit(false);
    setCurrentId(null);
    setNameError("");
    setContactError("");
  };

  const handleEdit = (id) => {
    const operatorToEdit = operators.find((op) => op.id === id);
    setName(operatorToEdit.name);
    setContact(operatorToEdit.contact);
    setAddress(operatorToEdit.address);
    setCurrentId(operatorToEdit.id);
    setIsEdit(true);
  };

  const handleDelete = (id) => {
    const updatedOperators = operators.filter((op) => op.id !== id);
    setOperators(updatedOperators);
    saveData(updatedOperators);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#DE3163",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{ marginTop: 0, marginLeft: 10 }}
          onPress={() => onClose()}
        >
          <Icon name="arrow-back" size={25} color="#ffffff" />
        </TouchableOpacity>
        <Text
          style={{
            color: "#ffffff",
            fontFamily: "outfit-medium",
            fontSize: 20,
            flex: 1,
            textAlign: "center",
          }}
        >
          SERVICE OPERATOR
        </Text>
      </View>
      <View style={styles.container}>
        <TextInput
          style={nameError ? styles.errorBorder : styles.input}
          placeholder="Name.."
          value={name}
          onChangeText={setName}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        <TextInput
          style={contactError ? styles.errorBorder : styles.input}
          placeholder="Contact No..."
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />
        {contactError ? (
          <Text style={styles.errorText}>{contactError}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: 5,
          }}
        >
          <View>
            <TouchableOpacity
              style={[
                styles.button,
                { height: "auto", width: 100, borderRadius: 10 },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                {isEdit ? "Update" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={[
                styles.button,
                { height: "auto", width: 100, borderRadius: 10 },
              ]}
              onPress={reset}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        {operators?.length > 0 && (
          <ScrollView contentContainerStyle={styles.scrollContainer} style={{height:540}}>
            <Text style={[styles.text, { textAlign: "center" }]}>
              Operator List
            </Text>

            <FlatList
              data={operators}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleEdit(item.id)}>
                  <View
                    style={[
                      styles.listItem,
                      {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View>
                      <Text style={styles.text}> Name : {item.name}</Text>
                      <Text style={styles.text}> Contact : {item.contact}</Text>
                      <Text style={styles.text}>Address: {item.address}</Text>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#E5E4E2",
                        padding: 10,
                        borderRadius: 50,
                      }}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Icon name="close" size={20} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
  },
  listItem: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 10,
  },
  button: {
    backgroundColor: "#DE3163",
    padding: 6,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "outfit-medium",
    fontSize: 15,
    color: "#ffffff",
  },
  text: {
    fontFamily: "outfit-medium",
    fontSize: 15,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ServiceOperator;
