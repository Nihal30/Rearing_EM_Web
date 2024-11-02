import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  Linking,
  Button,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
// import * as Sharing from 'expo-sharing'
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "../../components/Toast";
import SelectModelDialog from "../../components/SelectModal";
import BottomSheetModal from "../../components/BottemModal";
import CustomerKyc from "../../components/CustomerKyc";
import BarcodeScanner from "../../components/BarcodeScanner";
import { RadioButton } from "react-native-paper";
import PatternLock from "../../components/PatternLock";
import moment from "moment";
import { FormDataContext } from "../../hooks/FormDataConextApi";
import Checkbox from "expo-checkbox";
import { MaterialIcons } from "@expo/vector-icons";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const NewRecord = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState("");
  const [customerModel, setCustomerModel] = useState("");
  const [problems, setProblems] = useState("");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState("");
  const [lockCode, setLockCode] = useState("");
  const [pattern, setPattern] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [dateService, setDateService] = useState(new Date());
  const [timeService, setTimeService] = useState(new Date());
  const [isYesSelected, setIsYesSelected] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Pending");

  const [items, setItems] = useState([
    { label: "Pending", value: "Pending" },
    { label: "Repaired", value: "Repaired" },
    { label: "Delivered", value: "Delivered" },
    { label: "Canceled", value: "Canceled" },
  ]);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [kycVisible, setKycVisible] = useState(false);

  const [deviceWarranty, setDeviceWarranty] = useState("");
  const [profitAmount, setProfitAmount] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [owner, setOwner] = useState("");

  const [selectedLocation, setSelectedLocation] = useState("inHouse"); // Default selection
  const [serviceCenterName, setServiceCenterName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [contactNoError, setContactNoError] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [problemList, setProblemList] = useState([]);
  console.log("problemList", problemList);
  const [customerList, setCustomerList] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [customerKyc, setCustomerKyc] = useState({});
  const [isPowerSelected, setIsPowerSelected] = useState(false); // For Power Adapter
  const [isKeyboardSelected, setIsKeyboardSelected] = useState(false); // For Keyboard/Mouse
  const [isOtherDeviceSelected, setIsOtherDeviceSelected] = useState(false); // For Other Device
  const [validation, setValidation] = useState({
    orderError: false,
    customerError: false,
    modalError: false,
    problemError: false,
    timeError: false,
    dateError: false,
  });
  const [updateCustomer, setUpdateCustomer] = useState(null);

  // console.log("validation", validation);
  const [model, setModel] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [openOperator, setOpenOperator] = useState(false);
  const [valueOperator, setValueOperator] = useState(null);
  const [operator, setOperator] = useState([]);

  const getData = async () => {
    try {
      const operators = await AsyncStorage.getItem("operators");
      if (operators !== null) {
        setOperator(
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

  // const handlePowerSelection = () => {
  //   setPowerSelected((prev) => !prev);
  // };

  // const handleKeyboardSelection = () => {
  //   setKeyboardSelected((prev) => !prev);
  // };

  // const handleOtherDeviceSelection = () => {
  //   setOtherDeviceSelected((prev) => !prev);
  // };

  const addProblem = () => {
    if (problems.trim()) {
      setProblemList([...problemList, { text: problems, checked: false }]);
      setProblems("");
    }
  };

  const toggleCheckbox = (index) => {
    const updatedList = [...problemList];
    updatedList[index].checked = !updatedList[index].checked;
    setProblemList(updatedList);
  };

  const [isPatternModalVisible, setIsPatternModalVisible] = useState(false);

  // edit the form
  const { OldFormData } = useLocalSearchParams();

  const handleOpenPatternLock = () => {
    setIsPatternModalVisible(true);
  };

  const handleClosePatternLock = () => {
    setIsPatternModalVisible(false);
  };

  const handleScan = (data) => {
    setBarcode(data); // Set the scanned data in the input
    setScannerVisible(false); // Hide the scanner
  };

  const handleAddCustomer = (details) => {
    setCustomerDetails([...customerDetails, details]);
    // console.log("Customer Details Added:", details);
  };

  const openBottomSheet = () => {
    setBottomSheetVisible(true);
    setUpdateCustomer(null);
  };

  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  // customer modal open
  const openDialog = () => {
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const onDateChangeService = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setDateService(currentDate);
  };

  const onTimeChangeService = (event, selectedTime) => {
    const currentTime = selectedTime;
    setShowDatePicker(false);
    setTimeService(currentTime);
  };

  // footer function ---

  const message = "Hello";

  const handleCall = () => {
    Linking.openURL(`tel:${customerList[0]?.phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(
      `sms:${customerList[0]?.phone}?body=${encodeURIComponent(message)}`
    );
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?text=${encodeURIComponent(message)}&phone=${
        customerList[0]?.phone
      }`
    );
  };
  

  // const handlePrint = async () => {
  //   try {
  //     console.log("Preparing to download PDF...");

  //     // Generate HTML list items from the problems array
  //     // Check if problems array is defined and not empty
  //     const problem =
  //       Array.isArray(problemList) && problemList.length > 0
  //         ? problemList.map((problem) => `<li>${problem?.text}</li>`).join("")
  //         : "<li>No problems listed.</li>";

  //     // Prepare HTML content for the PDF
  //     const htmlContent = `
  //       <html>
  //         <head>
  //           <style>
  //             body { font-family: Arial, sans-serif; }
  //             h1 { color: #DE3163; }
  //             p { margin: 5px 0; }
  //             ul { padding-left: 20px; }
  //             li { margin: 3px 0; }
  //           </style>
  //         </head>
  //         <body>
  //           <h1>Record Details</h1>
  //           <p><strong>Order Status: </strong>${value}</p>
  //           <p><strong>Customer Name: </strong>${customerList[0].name}</p>
  //           <p><strong>Customer Phone: </strong>${customerList[0].phone}</p>
  //           <p><strong>Customer Address: </strong>${customerList[0].address}</p>
  //           <p><strong>Model: </strong>${model}</p>
  //           <p><strong>Problems: </strong></p>
  //           <ul>${problem}</ul>
  //           <p><strong>Price: </strong>${price}</p>
  //           <p><strong>Paid: </strong>${paid}</p>
  //           <p><strong>Lock Code: </strong>${lockCode}</p>
  //           <p><strong>Barcode: </strong>${barcode}</p>
  //         </body>
  //       </html>
  //     `;

  //     // Generate PDF from the HTML content
  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });

  //     console.log("PDF generated at temporary URI:", uri);

  //     // Move the generated PDF to a new location if desired
  //     const fileUri = `${FileSystem.documentDirectory}record.pdf`;
  //     await FileSystem.moveAsync({ from: uri, to: fileUri });

  //     console.log("PDF downloaded to:", fileUri);

  //     // Open or share the PDF
  //     if (await Sharing.isAvailableAsync()) {
  //       await Sharing.shareAsync(fileUri);
  //     } else {
  //       console.log("Sharing is not available on this device.");
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  const handlePrint = async () => {
    try {
      console.log("Preparing to download PDF...");

      // Generate HTML list items from the problems array
      const problem =
        Array.isArray(problemList) && problemList.length > 0
          ? problemList.map((problem) => `<li>${problem?.text}</li>`).join("")
          : "<li>No problems listed.</li>";

      // Check if customerKyc.Images is an array and has elements
    const imageUri = Array.isArray(customerKyc?.Images) && customerKyc.Images[0]?.uri;
    let base64Image = '';
    if (imageUri) {
      try {
        base64Image = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Image = `data:image/jpeg;base64,${base64Image}`;
      } catch (error) {
        console.error("Error reading image file:", error);
      }
    }

      // Prepare HTML content for the PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { color: #DE3163; }
              p { margin: 5px 0; }
              ul { padding-left: 20px; }
              li { margin: 3px 0; }
              img { max-width: 100%; height: 200; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>Record Details</h1>
             ${base64Image ? `<img src="${base64Image}" alt="Image" />` : '<p>No image available</p>'}
            <p><strong>${formDataId}</strong></p>
            <p><strong>Order Status : </strong>${value}</p>
            <p><strong>Customer Name : </strong>${customerList[0].name}</p>
            <p><strong>Customer Phone : </strong>${customerList[0].phone}</p>
            <p><strong>Customer Address : </strong>${
              customerList[0].address
            }</p>
            <p><strong>Model : </strong>${model}</p>
            <p><strong>Problems : </strong></p>
            <ul>${problem}</ul>
            <p><strong>Price : </strong>${price}</p>
            <p><strong>Paid : </strong>${paid}</p>
            <p><strong>Lock Code : </strong>${lockCode}</p>
            <p><strong>Barcode : </strong>${barcode}</p>
            <p><strong>Due Date : </strong>${moment(date).format(
              "DD MMM YYYY"
            )}</p>
            <p><strong>Power Adapter :</strong>${
              isPowerSelected ? "Yes" : "No"
            }</p>
            <p><strong>Keyboard/Mouse : </strong>${
              isKeyboardSelected ? "Yes" : "No"
            }</p>
            <p><strong>Other Device : </strong>${
              isOtherDeviceSelected ? "Yes" : "No"
            }</p>
            <p><strong>Name of Receiver : </strong>${owner}</p>
            <p><strong>Operator : </strong>${owner}</p>
            <p><strong>Location : </strong>${
              selectedLocation === "inHouse" ? "In House" : "Service Center"
            }</p>
            <p><strong>Additional Details : </strong>${additionalDetails}</p>
            <p><strong>Device Warranty : </strong>${deviceWarranty}</p>

          </body>
        </html>
      `;

      // Generate PDF from the HTML content, specifying the paper size
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 595, // A4 width in points (1/72 of an inch)
        height: 842, // A4 height in points
        base64: false, // Set to true if you need a base64 encoded string
      });

      console.log("PDF generated at temporary URI:", uri);

      // Move the generated PDF to a new location if desired
      const fileUri = `${FileSystem.documentDirectory}record.pdf`;
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      console.log("PDF downloaded to:", fileUri);

      // Open or share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        console.log("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // ----

  // Form submit
  const { formData, setFormData, addData, updateData } =
    useContext(FormDataContext);

  const [formDataId, setFormDataId] = useState(null); // State for managing form data ID

  const generateCustomId = () => {
    const timestamp = Date.now().toString(); // Current timestamp as a string
    const randomNum = Math.floor(Math.random() * 1000).toString();
    // Random number between 0 and 999
    return `ID-${timestamp}-${randomNum}`; // Constructed ID
  };

  const handleSubmit = async () => {
    // Validation: Check for required fields
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    if (
      !value ||
      !customerList.length ||
      !problemList.length ||
      !date ||
      !model ||
      !time
    ) {
      const newValidation = {
        orderError: !value && true,
        customerError: !customerList.length && true,
        modalError: !model && true,
        problemError: !problemList.length && true,
        timeError: !time && true,
        dateError: !date && true,
      };

      setValidation(newValidation);
      return; // Exit the function if validation fails
    }

    const newFormData = {
      id: formDataId || generateCustomId(), // Use existing ID if available, otherwise generate a new one
      currentDate: new Date(),
      orderDetails: value,
      operatorDetails: valueOperator,
      customerDetails: {
        customerList: customerList,
        AllCustomerDetails: customerDetails,
      },
      problems: problemList,
      price: price,
      paid: paid,
      lockCode: lockCode,
      barcode: barcode,
      date: date,
      time: time,
      owner: owner,
      isYesSelected: isYesSelected,
      deviceWarranty: deviceWarranty, // Optional
      profitAmount: profitAmount,
      additionalDetails: additionalDetails, // Optional
      customerKyc: customerKyc,
      model: model,
      selectedLocation: selectedLocation,
      pattern: pattern,
      accessories: {
        isPowerSelected: isPowerSelected,
        isKeyboardSelected: isKeyboardSelected,
        isOtherDeviceSelected: isOtherDeviceSelected,
      },
      serviceCenterName:
        selectedLocation === "serviceCenter" ? serviceCenterName : "",
      contactNo: selectedLocation === "serviceCenter" ? contactNo : "",
      serviceDate: dateService,
      serviceTime: timeService,
    };

    try {
      // Check if OldFormData is defined
      if (OldFormData) {
        // Parse OldFormData if it's a string
        const previousFormData =
          typeof OldFormData === "string"
            ? JSON.parse(OldFormData)
            : OldFormData;

        // Update existing item if it is found
        console.log("Updating existing entry with ID:", previousFormData.id);
        await updateData(previousFormData.id, newFormData);

        setToast({
          visible: true,
          message: "Data updated successfully!",
          type: "success",
        });
      } else {
        // If OldFormData is undefined, add new item
        console.log("Adding new entry with ID:", newFormData.id);
        await addData(newFormData);

        setToast({
          visible: true,
          message: "Data added successfully!",
          type: "success",
        });
      }

      // Navigate to another screen
      router.push("/");
      resetForm();

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setToast({ visible: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving data", error);

      setToast({
        visible: true,
        message: "Failed to save data!",
        type: "error",
      });

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setToast({ visible: false, message: "", type: "" });
      }, 3000);
    }
  };

  // Function to reset all form values
  const resetForm = () => {
    setFormDataId(""); // Clear the ID
    setOrderDetails("");
    setCustomerModel("");
    setProblems("");
    setPrice("");
    setPaid("");
    setLockCode("");
    setShowDatePicker(false);
    setShowTimePicker(false);
    setDate("");
    setTime("");
    setIsYesSelected(false);
    setToastVisible(false);
    setToastMessage("");
    setToastType("success");
    setOpen(false);
    setValue("Pending");
    setModel("");
    setItems([
      { label: "Laptop", value: "Laptop" },
      { label: "Hp", value: "Hp" },
      { label: "My", value: "My" },
    ]);
    setDialogVisible(false);
    setBottomSheetVisible(false);
    setCustomerDetails([]);
    setKycVisible(false);
    setDeviceWarranty("");
    setProfitAmount("");
    setAdditionalDetails("");
    setOwner("");
    setSelectedLocation("inHouse");
    setServiceCenterName("");
    setContactNo("");
    setBarcode("");
    setScannerVisible(false);
    setIsPatternModalVisible(false);
  };

  useEffect(() => {
    if (OldFormData !== undefined) {
      if (typeof OldFormData === "string") {
        try {
          // Parse the JSON string
          const previousFormData = JSON.parse(OldFormData);
          console.log("previousFormData", previousFormData);

          if (previousFormData) {
            setFormDataId(previousFormData?.id);
            setValue(previousFormData?.orderDetails);
            setValueOperator(previousFormData?.operatorDetails);
            setCustomerList(previousFormData?.customerDetails?.customerList);
            setCustomerDetails(
              previousFormData?.customerDetails?.AllCustomerDetails
            );
            setProblemList(previousFormData?.problems);
            setPrice(previousFormData?.price);
            setPaid(previousFormData?.paid);
            setDate(new Date(previousFormData?.date));
            setTime(new Date(previousFormData?.time));
            setOwner(previousFormData?.owner);
            setAdditionalDetails(previousFormData?.additionalDetails);
            setDeviceWarranty(previousFormData?.deviceWarranty);
            setProfitAmount(previousFormData?.profitAmount);
            setBarcode(previousFormData?.barcode);
            setCustomerKyc(previousFormData?.customerKyc);
            setModel(previousFormData?.model);
            setPattern(previousFormData?.pattern);
            setLockCode(previousFormData?.lockCode);
            // Set accessory selections if available
            setIsPowerSelected(previousFormData?.accessories?.isPowerSelected);
            setIsKeyboardSelected(
              previousFormData?.accessories?.isKeyboardSelected
            );
            setIsOtherDeviceSelected(
              previousFormData?.accessories?.isOtherDeviceSelected
            );
            setSelectedLocation(previousFormData.selectedLocation);

            // Check the selected location
            const location = previousFormData.selectedLocation; // Get selectedLocation
            if (location === "serviceCenter") {
              // Set contact number correctly
              setContactNo(previousFormData?.contactNo || "");
              setServiceCenterName(previousFormData?.serviceCenterName || "");
              console.log(
                "previousFormData?.serviceDate",
                previousFormData?.serviceDate
              );
              setTimeService(
                new Date(previousFormData?.serviceTime) || new Date()
              );
              setDateService(
                new Date(previousFormData?.serviceDate) || new Date()
              );
            } else if (location === "inHouse") {
              // Optionally clear service center details if inHouse is selected
              setContactNo("");
              setServiceCenterName("");
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        console.error("OldFormData is not a valid string:", OldFormData);
      }
    }
    console.log("OldFormData", OldFormData);
  }, [OldFormData]);

  const onSelectModel = async (item) => {
    await setCustomerList((prevDetails) => {
      // Check if the item is already in the list
      if (prevDetails.find((detail) => detail.id === item.id)) {
        return prevDetails; // If already selected, do not add again
      }
      return [...prevDetails, item];
    });
    console.log("customerList", customerList);
  };

  const removeItem = (name, phone) => {
    setCustomerList((prevList) =>
      prevList.filter((item) => item.name !== name || item.phone !== phone)
    );
  };

  const removeProblemsItem = (indexToRemove) => {
    setProblemList((prevList) =>
      prevList.filter((item, index) => index !== indexToRemove)
    );
  };
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners on unmount
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const openBottomSheetForUpdate = (customer) => {
    // console.log("item customer", customer);
    setUpdateCustomer(customer);

    setBottomSheetVisible(true);
  };

  const [searchText, setSearchText] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const handleSearchCustomers = async (text) => {
    setSearchText(text);
    const data = await AsyncStorage.getItem("customerDetails");
    const customerData = JSON.parse(data);
    if (text.length > 0 && customerData) {
      const filteredData = customerData.filter(
        (customer) =>
          customer.name.toLowerCase().includes(text.toLowerCase()) ||
          customer.phone.includes(text)
      );
      setFilteredCustomers(filteredData);
    } else {
      setFilteredCustomers([]);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        // display: isScannerVisible ? "none" : "block",
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          display: isScannerVisible ? "none" : "block",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#DE3163",
            padding: 10,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={{ marginTop: 40, marginLeft: 10 }}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={25} color="#ffffff" />
          </TouchableOpacity>

          {/* Header Text */}
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
            ADD RECORDS
          </Text>
        </View>

        {/* Form */}
        <ScrollView style={styles.formContainer} scrollEnabled={!openOperator}>
          <View>
            {/* Dropdown for Order Details */}
            <Text style={styles.label}>Order Details:</Text>
            <View style={{ zIndex: 100000 }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Select Order"
                style={[
                  styles.picker,
                  validation.orderError && styles.errorInput,
                ]}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
            {validation.orderError && (
              <Text style={{ margin: 10, color: "red" }}>
                Please select order type
              </Text>
            )}

            <View
              style={[
                styles.customerDetails,
                { borderRadius: 10, marginTop: 10, zIndex: 5000 },
                validation.customerError && styles.errorInput,
              ]}
            >
              <Text style={styles.label}>Customer Details</Text>

              {/* Buttons for Select and Add */}
              {customerList?.length > 0 &&
                customerList?.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.customerDetails,
                      {
                        margin: 10,
                        borderRadius: 10,
                        justifyContent: "space-between",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => openBottomSheetForUpdate(item)}
                  >
                    <View>
                      <Text style={{ fontFamily: "outfit", borderRadius: 10 }}>
                        Name : {item.name}
                      </Text>
                      {item.phone && (
                        <Text
                          style={{ fontFamily: "outfit", borderRadius: 10 }}
                        >
                          Phone : {item.phone}
                        </Text>
                      )}

                      {item.address && (
                        <Text
                          style={{ fontFamily: "outfit", borderRadius: 10 }}
                        >
                          Address : {item.address}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#D3D3D3",
                        padding: 2,
                        borderRadius: 30,
                      }}
                      onPress={() => removeItem(item.name, item.phone)}
                    >
                      <MaterialIcons name="close" size={24} color="red" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  zIndex: 10,
                }}
              >
                {/* Customer Details */}
                <View style={{ position: "relative", zIndex: 100 }}>
                  <TextInput
                    value={searchText}
                    onChangeText={handleSearchCustomers}
                    style={[styles.input, { width: 190, borderColor: "#ccc" }]}
                    placeholder="Search & Select List"
                  />
                  {filteredCustomers.length > 0 && (
                    <View
                      style={{
                        borderRadius: 10,
                        borderWidth: 1,
                        padding: 10,
                        marginTop: 2,
                        position: "absolute",
                        top: 50, // Adjusted to position just below the text input
                        left: 0,
                        right: 0,
                        width: 200, // Set the width to 200
                        alignSelf: "center", // Center the modal
                        backgroundColor: "white",
                        zIndex: 1000,
                        elevation: 5, // Adds shadow for better visibility on Android
                      }}
                    >
                      <FlatList
                        data={filteredCustomers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              marginVertical: 5,
                              backgroundColor: "#E5E4E2",
                              padding: 10,
                              borderRadius: 10,
                            }}
                            onPress={() => {
                              onSelectModel(item);
                              handleSearchCustomers("");
                            }}
                          >
                            <Text style={styles.item}>
                              {item.name} / {item.phone}
                            </Text>
                          </TouchableOpacity>
                        )}
                        style={{
                          backgroundColor: "white", // Ensure background is opaque
                        }}
                      />
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { height: 50, width: 70, borderRadius: 10 },
                  ]}
                  onPress={openDialog}
                >
                  <Text style={styles.buttonText}>Select</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { height: 50, width: 70, borderRadius: 10 },
                  ]}
                  onPress={openBottomSheet}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            {validation.customerError && (
              <Text style={{ margin: 10, color: "red" }}>
                Please select customer
              </Text>
            )}
            <Text style={[styles.label, { marginTop: 10 }]}>Model</Text>

            <TextInput
              value={model}
              onChangeText={setModel}
              style={[
                styles.input,
                { height: 50, marginTop: 2 },
                validation.modalError && styles.errorInput,
              ]} // Adjust height for multiline
              placeholder="Model"
              multiline
            />
            {validation.modalError && (
              <Text style={{ margin: 10, color: "red" }}>Please add model</Text>
            )}

            {/* Multiline Input for Problems */}
            <Text style={[styles.label, { marginTop: 10 }]}>
              Write Problems:
            </Text>
            {problemList?.length > 0 && (
              <ScrollView
                style={{
                  borderWidth: 0.8,
                  margin: 2,
                  marginBottom: 5,
                  borderRadius: 10,
                }}
              >
                {problemList.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      gap: 10,
                      margin: 10,
                      marginLeft: 12,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        gap: 10,
                        margin: 10,
                        marginLeft: 12,
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        value={item.checked}
                        onValueChange={() => toggleCheckbox(index)}
                        style={{ color: "gray" }}
                      />
                      <Text style={item.checked && styles.checkedText}>
                        {item.text}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#D3D3D3",
                        padding: 1,
                        borderRadius: 30,
                      }}
                      onPress={() => removeProblemsItem(index)}
                    >
                      <MaterialIcons name="close" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={{ flex: 1, width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                }}
              >
                <TextInput
                  value={problems}
                  onChangeText={setProblems}
                  style={[
                    styles.input,
                    { width: "75%" },
                    validation.problemError && styles.errorInput,
                  ]}
                  placeholder="Describe problems"
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    { height: 50, width: 70, borderRadius: 10 },
                  ]}
                  onPress={addProblem}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {validation.problemError && (
              <Text style={{ margin: 10, color: "red" }}>
                Please add problems list
              </Text>
            )}

            {/* Button for Customer KYC */}
            <TouchableOpacity
              style={[styles.button, { marginTop: 15 }]}
              onPress={() => setKycVisible(true)}
            >
              <Text style={styles.buttonText}>Model Details</Text>
            </TouchableOpacity>

            {/* Price and Paid Inputs */}
            <Text style={styles.label}>Price:</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              style={styles.input}
              placeholder="Enter price"
              keyboardType="numeric"
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Paid:</Text>
            <TextInput
              value={paid}
              onChangeText={setPaid}
              style={styles.input}
              placeholder="Enter paid amount"
              keyboardType="numeric"
            />

            {/* Lock Code Input */}
            <Text style={[styles.label, { marginTop: 10 }]}>Lock Code:</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TextInput
                value={lockCode}
                onChangeText={setLockCode}
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter lock code"
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    alignItems: "center",
                    justifyContent: "center",
                    height: 50,
                  },
                ]}
              >
                <Text style={styles.buttonText} onPress={handleOpenPatternLock}>
                  Pattern
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <Text style={[styles.label, { marginTop: 10 }]}>Select Date:</Text>
            {date && (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  padding: 10,
                  margin: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontFamily: "outfit-medium" }}>
                  Date: {date ? moment(date).format("DD MMM YYYY") : ""}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#D3D3D3",
                    padding: 2,
                    borderRadius: 30,
                  }}
                  onPress={() => setDate(new Date())}
                >
                  {/* <MaterialIcons name="close" size={24} color="red" /> */}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Show Date Picker</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Time Picker */}
            <Text style={styles.label}>Select Repair Time:</Text>
            {time && (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  padding: 10,
                  margin: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontFamily: "outfit-medium" }}>
                  Time: {time ? moment(time).format("HH:mm") : ""}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#D3D3D3",
                    padding: 2,
                    borderRadius: 30,
                  }}
                  onPress={() => setTime(new Date())}
                >
                  {/* <MaterialIcons name="close" size={24} color="red" /> */}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Show Time Picker</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            {/* Radio Group for Yes/No */}
            <Text style={[styles.label, { marginTop: 10 }]}>Accessories</Text>
            <View style={{}}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.label, { marginTop: 10, width: 200 }]}>
                  Power Adapter
                </Text>
                <View
                  style={[styles.radioGroup, { flex: 1, flexDirection: "row" }]}
                >
                  <RadioButton
                    value="yes"
                    status={isPowerSelected === true ? "checked" : "unchecked"}
                    onPress={() => setIsPowerSelected(true)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>Yes</Text>
                  <RadioButton
                    value="no"
                    status={isPowerSelected === false ? "checked" : "unchecked"}
                    onPress={() => setIsPowerSelected(false)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>No</Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.label, { marginTop: 10, width: 200 }]}>
                  Keyboard/Mouse
                </Text>
                <View
                  style={[styles.radioGroup, { flex: 1, flexDirection: "row" }]}
                >
                  <RadioButton
                    value="yes"
                    status={
                      isKeyboardSelected === true ? "checked" : "unchecked"
                    }
                    onPress={() => setIsKeyboardSelected(true)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>Yes</Text>
                  <RadioButton
                    value="no"
                    status={
                      isKeyboardSelected === false ? "checked" : "unchecked"
                    }
                    onPress={() => setIsKeyboardSelected(false)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>No</Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.label, { marginTop: 10, width: 200 }]}>
                  Other Device
                </Text>
                <View
                  style={[styles.radioGroup, { flex: 1, flexDirection: "row" }]}
                >
                  <RadioButton
                    value="yes"
                    status={
                      isOtherDeviceSelected === true ? "checked" : "unchecked"
                    }
                    onPress={() => setIsOtherDeviceSelected(true)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>Yes</Text>
                  <RadioButton
                    value="no"
                    status={
                      isOtherDeviceSelected === false ? "checked" : "unchecked"
                    }
                    onPress={() => setIsOtherDeviceSelected(false)}
                  />
                  <Text style={[styles.label, { marginTop: 8 }]}>No</Text>
                </View>
              </View>
            </View>

            {/* Barcode Input */}
            <Text style={[styles.label, { marginTop: 10 }]}>Barcode:</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TextInput
                value={barcode}
                onChangeText={setBarcode}
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter or scan barcode"
              />
              <TouchableOpacity
                onPress={() => setScannerVisible(true)}
                style={[
                  styles.button,
                  {
                    alignItems: "center",
                    justifyContent: "center",
                    height: 50,
                  },
                ]}
              >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            {/* Owner/Assistant */}
            <View
              style={[
                styles.customerDetails,
                { borderRadius: 10, marginTop: 10, zIndex: 500 },
              ]}
            >
              <TextInput
                value={owner}
                onChangeText={setOwner}
                style={[styles.input, { height: 50, marginTop: 10 }]} // Adjust height for multiline
                placeholder="Name Of Receiver(Owner/Assistant)"
                multiline
              />
              <View style={{ position: "relative", zIndex: 500 }}>
                {/* Dropdown for Order Details */}
                <Text style={styles.label}>Select Operator</Text>

                <DropDownPicker
                  open={openOperator}
                  value={valueOperator}
                  items={operator}
                  setOpen={setOpenOperator}
                  setValue={setValueOperator}
                  setItems={setOperator}
                  placeholder="Select Operator"
                  style={[styles.picker]}
                  dropDownContainerStyle={[
                    styles.dropdownContainer,
                    {
                      height: 200,
                      borderColor: "#ccc",

                      position: "absolute",
                      zIndex: 1000,
                    },
                  ]}
                  // Specify direction if necessary
                  // Make sure it appears on top of other components
                />
                <Text style={[styles.label, { marginTop: 10 }]}>
                  Other Location:
                </Text>
                <RadioButton.Group
                  onValueChange={setSelectedLocation}
                  value={selectedLocation}
                >
                  <View style={styles.radioContainer}>
                    <RadioButton value="inHouse" />
                    <Text>In-house</Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <RadioButton value="serviceCenter" />
                    <Text>Service Center</Text>
                  </View>
                </RadioButton.Group>

                {selectedLocation === "serviceCenter" && (
                  <View style={{ flex: 1 }}>
                    {/* <TextInput
                    value={serviceCenterName}
                    onChangeText={setServiceCenterName}
                    style={[styles.input, { height: 50, marginTop: 10 }]}
                    placeholder="Name of the Service Center"
                  />
                  <TextInput
                    value={contactNo}
                    onChangeText={(text) => {
                      setContactNo(text);
                      if (text.length !== 10) {
                        setContactNoError(true); // Set error if not 10 digits
                      } else {
                        setContactNoError(false); // Clear error if valid
                      }
                    }}
                    style={[
                      styles.input,
                      {
                        height: 50,
                        marginTop: 10,
                        borderColor: contactNoError ? "red" : "gray",
                      },
                    ]}
                    placeholder="Contact No"
                    keyboardType="phone-pad"
                  /> */}

                    {/* Date Picker */}
                    <Text style={[styles.label, { marginTop: 10 }]}>
                      Select Date:
                    </Text>
                    {dateService && (
                      <View
                        style={{
                          backgroundColor: "#ffffff",
                          padding: 10,
                          margin: 10,
                          borderWidth: 1,
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontFamily: "outfit-medium" }}>
                          Date:{" "}
                          {dateService
                            ? moment(dateService).format("DD MMM YYYY")
                            : ""}
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D3D3D3",
                            padding: 2,
                            borderRadius: 30,
                          }}
                          onPress={() => dateService(new Date())}
                        >
                          {/* <MaterialIcons name="close" size={24} color="red" /> */}
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Show Date Picker</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateService}
                        mode="date"
                        display="default"
                        onChange={onDateChangeService}
                      />
                    )}

                    {/* Time Picker */}
                    <Text style={styles.label}>Select Repair Time:</Text>
                    {timeService && (
                      <View
                        style={{
                          backgroundColor: "#ffffff",
                          padding: 10,
                          margin: 10,
                          borderWidth: 1,
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontFamily: "outfit-medium" }}>
                          Time:{" "}
                          {timeService
                            ? moment(timeService).format("HH:mm")
                            : ""}
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#D3D3D3",
                            padding: 2,
                            borderRadius: 30,
                          }}
                          onPress={() => setTimeService(new Date())}
                        >
                          {/* <MaterialIcons name="close" size={24} color="red" /> */}
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(true)}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Show Time Picker</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                      <DateTimePicker
                        value={timeService}
                        mode="time"
                        display="default"
                        onChange={onTimeChangeService}
                      />
                    )}

                    {contactNoError && (
                      <Text
                        style={{ marginTop: 5, marginBottom: 10, color: "red" }}
                      >
                        Add 10 digit number
                      </Text>
                    )}
                    <View
                      style={[
                        styles.buttonContainer,
                        {
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "space-around",
                          marginTop: 10,
                          marginBottom: 10,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${contactNo}`)}
                        style={[
                          styles.button,
                          { height: "100%", width: 90, borderRadius: 10 },
                        ]}
                      >
                        <Icon name="call" size={25} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            `whatsapp://send?text=${encodeURIComponent(
                              message
                            )}&phone=${contactNo}`
                          )
                        }
                        style={[
                          styles.button,
                          { height: "100%", width: 90, borderRadius: 10 },
                        ]}
                      >
                        <Icon name="logo-whatsapp" size={25} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            `sms:${contactNo}?body=${encodeURIComponent(
                              message
                            )}`
                          )
                        }
                        style={[
                          styles.button,
                          { height: "100%", width: 90, borderRadius: 10 },
                        ]}
                      >
                        <Icon
                          name="chatbox-ellipses"
                          size={25}
                          color="#ffffff"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Additional Details */}
            <TextInput
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              style={[styles.input, { height: 50, marginTop: 10 }]} // Adjust height for multiline
              placeholder="Additional Details"
              multiline
            />

            {/* <Text style={[styles.label, { marginTop: 10 }]}>
            * Enter Profit Amount Below to Calculate Day-Wise
          </Text>
          <TextInput
            value={profitAmount}
            onChangeText={setProfitAmount}
            style={styles.input}
            placeholder="Profit From Order"
            keyboardType="numeric"
          /> */}

            {/* Device Warranty*/}
            <Text style={[styles.label, { marginTop: 10 }]}>
              * Enter Warranty. This will show to users if he is a user of
              Mobile Solution Application and using the same number or
              alternative number for Mobile Solution App Account. He can see
              order status, order details, order images.
            </Text>
            <TextInput
              value={deviceWarranty}
              onChangeText={setDeviceWarranty}
              style={[styles.input, { height: 50 }]} // Adjust height for multiline
              placeholder="Device Warranty"
              multiline
            />

            <View style={{ marginBottom: 30 }} />
          </View>
        </ScrollView>

        {/* Footer */}
        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>

            <View style={styles.horizontalButtons}>
              <TouchableOpacity
                style={styles.horizontalButton}
                onPress={handleCall}
              >
                <Text style={styles.buttonText}>
                  <Icon name="call" size={25} color="#ffffff" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.horizontalButton}
                onPress={handleMessage}
              >
                <Text style={styles.buttonText}>
                  <Icon name="chatbox-ellipses" size={25} color="#ffffff" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.horizontalButton}
                onPress={handleWhatsApp}
              >
                <Text style={styles.buttonText}>
                  <Icon name="logo-whatsapp" size={25} color="#ffffff" />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.horizontalButton}
                onPress={handlePrint}
              >
                <Text style={styles.buttonText}>
                  <Icon name="print" size={25} color="#ffffff" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Toast component */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />
      {/* Select Model Dialog */}
      <SelectModelDialog
        visible={isDialogVisible}
        onClose={closeDialog}
        customerDetails={customerDetails}
        onSelectModel={onSelectModel}
        setCustomerList={setCustomerList}
        customerList={customerList}
      />
      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        visible={isBottomSheetVisible}
        onClose={closeBottomSheet}
        headerText="Add Customer Details"
        onAddCustomer={handleAddCustomer}
        setCustomerDetails={setCustomerDetails}
        updateCustomer={updateCustomer}
        setCustomerList={setCustomerList}
      />

      <CustomerKyc
        visible={kycVisible}
        onClose={() => setKycVisible(false)}
        customerKyc={customerKyc}
        setCustomerKyc={setCustomerKyc}
      />

      {isScannerVisible && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerVisible(false)}
        />
      )}

      {/* Pattern Lock Modal */}
      <PatternLock
        visible={isPatternModalVisible}
        onClose={handleClosePatternLock}
        pattern={pattern}
        setPattern={setPattern}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    display: "none",
  },
  errorInput: {
    borderColor: "red",
  },
  formContainer: {
    flex: 1,
    padding: 10,
    // Add any additional styles for the form container
  },
  label: {
    fontFamily: "outfit",
    margin: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
    // marginBottom: 10,
    borderColor: "#ccc",
  },
  picker: {
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginBottom: 10,
    zIndex: 100,
  },
  button: {
    backgroundColor: "#DE3163",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
    // height:'100%',
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
  },
  footer: {
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "#ffffff",
  },
  submitButton: {
    backgroundColor: "#DE3163",
    padding: 15,

    borderRadius: 5,
    width: "90%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  horizontalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    height: 50,
    marginBottom: 5,
  },
  horizontalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "#DE3163",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    alignItems: "center",
  },
  picker: {
    width: "100%",
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  dropdownContainer: {
    width: "100%",
    marginTop: 5, // Adjust the margin to position it just below the picker
    borderColor: "#ccc",
  },
  customerDetails: {
    flex: 1,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});

export default NewRecord;
