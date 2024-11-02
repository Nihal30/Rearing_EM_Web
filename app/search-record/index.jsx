import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FormDataContext } from "../../hooks/FormDataConextApi";
import NoData from "../../assets/images/noData.jpg";
import Toast from "../../components/Toast";
import RNPickerSelect from "react-native-picker-select";
import { Button } from "react-native-paper";
import NotificationComponent, {
  triggerNotification,
} from "../../components/NotificationConfig";
import moment from "moment";
import Entypo from "@expo/vector-icons/Entypo";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ServiceOperator from "../../components/ServiceOperator";

const SearchRecord = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { formData, deleteData } = useContext(FormDataContext);
  const [filteredData, setFilteredData] = useState(formData);
  const [operatorId, setOperatorId] = useState("all");
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  const [orderType, setOrderType] = useState(null); // Initially null for 'All'
  const [isService, setIsService] = useState("all");
  const [isTodayFilter, setIsTodayFilter] = useState(false); // State for "Today" filter

  useEffect(() => {
    setFilteredData(formData); // Display all data initially
  }, [formData]);

  // Function to handle filtering based on search text, order type, service, and date
  const handleSearch = () => {
    const today = new Date(); // Get current date in YYYY-MM-DD format

    const filtered = formData.filter((item) => {
      const matchesSearchText =
        item.orderDetails.toLowerCase().includes(searchText.toLowerCase()) ||
        item.customerDetails?.customerList[0]?.name
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        false;

      const matchesOrderType = orderType
        ? item.orderDetails === orderType
        : true; // If orderType is null, show all records

      const matchesService =
        isService === null // If "All" is selected, show all records
          ? true
          : isService === "inHouse"
          ? item.selectedLocation === "inHouse"
          : isService === "serviceCenter"
          ? item.selectedLocation === "serviceCenter"
          : false;
          // console.log('item', item)
          // console.log('valueOperator', valueOperator)

          const matchesOperator =
          valueOperator === "all" ? true : item.operatorDetails === valueOperator; // If "All" is selected, show all records

      // Safely check if today's filter is enabled and date matches
      const orderDate = moment(item.date).format("DD-MMM-YYYY");
      const TodayDate = moment(today).format("DD-MMM-YYYY");
      const matchesToday =
        isTodayFilter === true ? orderDate === TodayDate : true; // If 'Today' filter is active, check if date matches
      console.log("orderDate", orderDate);
      console.log("today", TodayDate);

      return (
        matchesSearchText && matchesOrderType && matchesService && matchesToday && matchesOperator
      );
    });

    setFilteredData(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [orderType, isService, isTodayFilter,valueOperator]);

  // Function to get styles for different order statuses
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

  // Function to handle deletion of a record
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("id", id);
              await deleteData(id);
              setToast({
                visible: true,
                message: "Record deleted successfully!",
                type: "success",
              });
            } catch (error) {
              setToast({
                visible: true,
                message: "Failed to delete record!",
                type: "error",
              });
            }

            // Hide the toast after 3 seconds
            setTimeout(() => {
              setToast({ visible: false, message: "", type: "" });
            }, 3000);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const [message, setMessage] = useState(null);

  const triggerNotification = (title, body) => {
    setMessage(`${title}\n${body}`); // Fixed the message formatting
    console.log("Notification trigger");

    setTimeout(() => {
      setMessage(null);
    }, 1000);
  };

  // Push notification
  // Push notification
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDateTime = new Date();

      formData.forEach((item) => {
        const itemDate = new Date(item.date);

        const timeDifference = Math.abs(currentDateTime - itemDate) / 60000; // Difference in minutes

        if (timeDifference <= 5) {
          // Trigger if the difference is within 5 minutes
          triggerNotification(
            `Order Status: ${item?.orderDetails}`, // Fixed string
            `Name/Phone: ${item.customerDetails.customerList[0].name} / ${item.customerDetails.customerList[0].phone}`
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval); // Clean up interval on unmount
  });

  // Oprater changes
  const [open, setOpen] = useState(false);
  const [valueOperator, setValueOperator] = useState("all");
  const [items, setItems] = useState([]);
  const [openService, setOpenService] = useState(false);
  // const [filteredData, setFilteredData] = useState(formData || []);
  const getData = async () => {
    try {
      const operators = await AsyncStorage.getItem("operators");
      if (operators !== null) {
        setItems([
          { label: "All", value: "all" }, // Add "All" option
          ...JSON.parse(operators).map((op) => ({
            label: op.name,
            value: op.id,
          })),
        ]);
      }
    } catch (error) {
      console.error("Failed to load operators", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleOperatorChange = (operatorId) => {
    console.log("Selected Operator ID:", operatorId);
    setValueOperator(operatorId);

    // const filtered = formData.filter((item) => {
    //   // Show all data if "All" is selected
    //   const matchesOperator =
    //     operatorId === "all" ? true : item.operatorDetails === operatorId;
    //   return matchesOperator;
    // });

    // setFilteredData(filtered);
  };

  // useEffect(() => {
  //   const filtered = formData.filter((item) => {
  //     const matchesOperator =
  //       value === "all" ? true : item.operatorDetails === value;
  //     return matchesOperator;
  //   });

  //   setFilteredData(filtered);
  // }, [value]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
          SEARCH RECORDS
        </Text>
      </View>

      {/* Search Input with Icon */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#cccccc"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search Customer Name."
          placeholderTextColor="#cccccc"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
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
            value={valueOperator}
            items={items}
            setOpen={setOpen}
            setValue={handleOperatorChange}
            setItems={setItems}
            placeholder="Select Operator"
            style={[styles.picker]}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              height: 50,
              width: 70,
              borderRadius: 10,
              backgroundColor: "#ccc",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#DE3163",
            },
          ]}
          onPress={() => setOpenService(true)}
        >
          <Text style={styles.buttonText}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            width: 130,
            height: 45,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RNPickerSelect
            onValueChange={(value) => setOrderType(value)}
            items={[
              { label: "All", value: null },
              { label: "Pending", value: "Pending" },
              { label: "Repaired", value: "Repaired" },
              { label: "Delivered", value: "Delivered" },
              { label: "Canceled", value: "Canceled" },
            ]}
            placeholder={{ label: "Select Order Type", value: null }}
          />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            width: 130,
            height: 45,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RNPickerSelect
            onValueChange={(value) => setIsService(value)}
            items={[
              { label: "All", value: null },
              { label: "House", value: "inHouse" },
              { label: "Service Center", value: "serviceCenter" },
            ]}
            placeholder={{ label: "Select Order Type", value: null }}
          />
        </View>

        {/* <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>Service</Text>
          <Switch
            value={isService}
            onValueChange={(value) => setIsService(value)}
          />
        </View> */}

        <Button
          style={{ backgroundColor: isTodayFilter ? "#DE3163" : "#E5E4E2" }} // Highlight if active
          textColor={isTodayFilter ? "white" : "black"}
          onPress={() => {
            setIsTodayFilter((prev) => !prev); // Toggle the 'Today' filter
            handleSearch(); // Reapply the search filter
          }}
        >
          Today
        </Button>
      </View>

      {/* List of Items */}
      {/* <ScrollView> */}
      <View style={styles.listContainer}>
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
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/records",
                    params: { OldFormData: JSON.stringify(item) },
                  })
                }
              >
                {/* {console.log("items", item.customerKyc.Images)} */}
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
                        <Text style={styles.titleText}>Due Date:</Text>
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
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Icon name="close" size={20} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/records")}
        >
          <Entypo name="add-to-list" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* </ScrollView> */}

      {message && <NotificationComponent message={message} />}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
        />
      )}
      <ServiceOperator
        visible={openService}
        onClose={() => setOpenService(false)}
      />
    </View>
  );
};

export default SearchRecord;

const styles = StyleSheet.create({
  dropdownContainer: {
    width: 280,
    borderColor: "#ccc",
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
  floatingButton: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "#DE3163",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    bottom: 20,
    right: 20,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  picker: {
    width: 280,
    borderColor: "#ccc",
  },
});
