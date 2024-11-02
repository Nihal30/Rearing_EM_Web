import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import DropDownPicker from "react-native-dropdown-picker";
import { Button } from "react-native-paper";
import { useRouter } from "expo-router";
import ServiceOperator from "../../components/ServiceOperator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormDataContext } from "../../hooks/FormDataConextApi";
import NoData from "../../assets/images/noData.jpg";

const index = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredData, setFilteredData] = useState(formData || []);

  const { formData, deleteData } = useContext(FormDataContext);
  useEffect(() => {
    setFilteredData(formData); // Display all data initially
  }, [formData]);

  const [openService, setOpenService] = useState(false);
  
  const getOrderStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return styles.pendingStatus;
      case "Repaired":
        return styles.repairedStatus;
      case "Delivered":
        return styles.deliveredStatus;
      case "Canceled":
        return styles.canceledStatus;
      default:
        return {}; // Return empty object if no match is found
    }
  };
  const getData = async () => {
    try {
      const operators = await AsyncStorage.getItem("operators");
      if (operators !== null) {
        setItems(
          JSON.parse(operators).map((op) => ({ label: op.name, value: op.id }))
        );
      }
    } catch (error) {
      console.error("Failed to load operators", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleOperatorChange = (operatorId) => {
    console.log("Selected Operator ID:", operatorId); // Log the selected operator ID
    setValue(operatorId);

    // handleOperatorFilter(operatorId); // Call the new filtering function
    const filtered = formData.filter((item) => {
      // Check if operatorDetails is an array or a string
      const matchesOperator = value
      ? item.operatorDetails === value
      : true; 

      return matchesOperator; // Return true if there's a match
    });

    setFilteredData(filtered);
  };

  useEffect(()=>{
    const filtered = formData.filter((item) => {
      // Check if operatorDetails is an array or a string
      const matchesOperator = value
      ? item.operatorDetails === value
      : true; 

      return matchesOperator; // Return true if there's a match
    });

    setFilteredData(filtered);

  },[value])

  return (
    <View>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#DE3163",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{ marginTop: 40, marginLeft: 10 }}
          onPress={() => router.back()}
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
            marginTop: 40,
          }}
        >
          SERVICE OPERATOR
        </Text>
      </View>

      <View
        style={{
          marginVertical: 10,
          marginHorizontal: 10,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <View>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={ handleOperatorChange}
            setItems={setItems}
            placeholder="Select Operator"
            style={[styles.picker]}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>
        <View>
          <TouchableOpacity
            style={[styles.button, { height: 50, width: 70, borderRadius: 10 }]}
            onPress={() => setOpenService(true)}
          >
            <Text style={styles.buttonText}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ height: 670 }}>
        {/* <View style={styles.listContainer}> */}
        {filteredData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image source={NoData} style={styles.noDataImage} />
            <Text style={styles.noDataText}>No records found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.cardContainer}>
                  {/* Image */}
                  {/* Image */}
                  {item.customerKyc.Images &&
                  item.customerKyc.Images.length > 0 ? (
                    <Image
                      source={{ uri: item.customerKyc.Images[0]?.uri }} // Display the first image from the array
                      style={styles.itemImage}
                    />
                  ) : (
                    <Image
                      source={NoData} // Fallback image if no images are available
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  )}

                  <View style={styles.infoContainer}>
                    {/* Order Status */}
                    <View style={styles.titleValueContainer}>
                      <Text
                        style={[
                          styles.valueText,
                          getOrderStatusStyle(item?.orderDetails),
                        ]}
                      >
                        {item?.orderDetails}
                      </Text>
                    </View>

                    {/* Customer Name */}
                    {item?.customerDetails?.customerList?.length > 0 && (
                      <View style={styles.titleValueContainer}>
                        <Text style={styles.titleText}>Customer Name:</Text>
                        <Text style={styles.valueText}>
                          {item.customerDetails.customerList[0].name}
                        </Text>
                      </View>
                    )}

                    {/* Phone Number */}
                    {item?.customerDetails?.customerList?.length > 0 && (
                      <View style={styles.titleValueContainer}>
                        <Text style={styles.titleText}>Phone Number:</Text>
                        <Text style={styles.valueText}>
                          {item.customerDetails.customerList[0].phone}
                        </Text>
                      </View>
                    )}

                    {/* collected */}
                    <View style={styles.titleValueContainer}>
                      <Text style={styles.titleText}>collected Date:</Text>
                      <Text style={styles.valueText}>
                        {new Date(item.currentDate).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Date */}
                    <View style={styles.titleValueContainer}>
                      <Text style={styles.titleText}>Date:</Text>
                      <Text style={styles.valueText}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Model */}
                    <View style={styles.titleValueContainer}>
                      <Text style={styles.titleText}>Model:</Text>
                      <Text style={styles.valueText}>{item.model}</Text>
                    </View>
                  </View>

                  {/* Delete Icon */}
                  {/* <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Icon name="close" size={20} color="#ff0000" />
                  </TouchableOpacity> */}
                </View>
              </View>
            )}
          />
        )}
        {/* </View> */}
      </ScrollView>

      <ServiceOperator
        visible={openService}
        onClose={() => setOpenService(false)}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  dropdownContainer: {
    width: 280,
    borderColor: "#ccc",
  },
  picker: {
    width: 280,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#DE3163",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchIcon: {
    position: "absolute",
    left: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 40,
  },
  searchButton: {
    backgroundColor: "#DE3163",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "outfit-medium",
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  noDataImage: {
    width: 200,
    height: 200,
  },
  noDataText: {
    fontSize: 20,
    fontFamily: "outfit-medium",
    color: "#cccccc",
    marginTop: 20,
  },
  listItem: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 10,
  },
  titleValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
  },
  valueText: {
    fontFamily: "outfit-regular",
    fontSize: 16,
  },
  pendingStatus: {
    color: "#fff", // yellow
    backgroundColor: "#FF5F15",
    fontFamily: "outfit-bold",
    fontSize: 20,
    paddingHorizontal: 30,

    borderRadius: 10,
  },
  repairedStatus: {
    color: "#ffffff", // green
    backgroundColor: "#00cc00",
    fontFamily: "outfit-bold",
    fontSize: 20,
    paddingHorizontal: 30,

    borderRadius: 10,
  },
  deliveredStatus: {
    color: "#fff", // blue
    backgroundColor: "#0000ff",
    fontFamily: "outfit-bold",
    fontSize: 20,
    paddingHorizontal: 30,

    borderRadius: 10,
  },
  canceledStatus: {
    color: "#fff", // red
    backgroundColor: "#ff0000",
    fontFamily: "outfit-bold",
    fontSize: 20,
    paddingHorizontal: 30,

    borderRadius: 10,
  },

  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E4E2",
    padding: 10,
    borderRadius: 10,
    position: "relative", // Make the container a relative parent for absolute positioning
  },
  itemImage: {
    width: 80,

    height: "100%",
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  deleteIcon: {
    position: "absolute", // Absolute positioning to place it on top-right
    top: 5, // Distance from the top of the card
    right: 5, // Distance from the right side of the card
    backgroundColor: "#D3D3D3",
    padding: 5,
    borderRadius: 20,
  },
  titleValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  titleText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
  },
  valueText: {
    fontFamily: "outfit-regular",
    fontSize: 16,
  },
});
