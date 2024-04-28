import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Button, Text, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function TabOneScreen() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigree: '',
    age: ''
  });
  const [predValue, setPredValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    // Check if the input value is a valid number
    const numericValue = value === '' ? '' : parseFloat(value);
    if (!isNaN(numericValue) || value === '') {
      setFormData({ ...formData, [name]: numericValue });
    }
  };

  useEffect(() => {
    console.log(formData); // Logging user input whenever it changes
  }, [formData]);

  const handleSubmit = async () => {
    setLoading(true);
    const formattedData = [
      formData.pregnancies,
      formData.glucose,
      formData.bloodPressure,
      formData.skinThickness,
      formData.insulin,
      formData.bmi,
      formData.diabetesPedigree,
      formData.age
    ];
    try {
      const response = await axios.post("http://192.168.8.159:5000/predict-diabetes", { data: formattedData });
      setPredValue(response.data.prediction);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch data from server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearInputs = () => {
    setFormData({
      pregnancies: '',
      glucose: '',
      bloodPressure: '',
      skinThickness: '',
      insulin: '',
      bmi: '',
      diabetesPedigree: '',
      age: ''
    });
    setPredValue(null);
  };

  const handleNext = () => {
    // Logic for handling next action
    console.log("Next button clicked");
  };

  const handleTips = () => {
    // Logic for handling tips action
    console.log("Tips button clicked");
  };

  return (
    <View style={styles.container}>
   

      <Text style={styles.sectionTitle}>Enter Patient Diabetes Data</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pregnancies"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('pregnancies', text)}
          value={formData.pregnancies.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Glucose"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('glucose', text)}
          value={formData.glucose.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Blood Pressure"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('bloodPressure', text)}
          value={formData.bloodPressure.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Skin Thickness"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('skinThickness', text)}
          value={formData.skinThickness.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Insulin"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('insulin', text)}
          value={formData.insulin.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="BMI"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('bmi', text)}
          value={formData.bmi.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Diabetes Pedigree"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('diabetesPedigree', text)}
          value={formData.diabetesPedigree.toString()} // Convert number to string for TextInput value
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange('age', text)}
          value={formData.age.toString()} // Convert number to string for TextInput value
        />
      </View>

      {loading && <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />}
      {predValue !== null && (
        <Text style={styles.predictionText}>Predicted Value: {predValue}</Text>
      )}


      <View style={styles.buttonContainer}>
      {predValue && predValue.toLowerCase() === "diabetes positive" ? (
          <Button title="Next " onPress={handleNext} />
        ) : (
          <Button title="Tips" onPress={handleTips} />
        )}
        <Button title="Predict" onPress={handleSubmit} />
        <Button title="Clear Inputs" onPress={handleClearInputs} />
      </View>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  predictionText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    position: 'absolute',
    zIndex: 1,
  },
});
