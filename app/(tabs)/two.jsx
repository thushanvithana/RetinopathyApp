import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Button, Text, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function TabTwoScreen() {
  
  const [gender, setGender] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [hbA1c, setHbA1c] = useState('');
  const [avgGlucose, setAvgGlucose] = useState('');
  const [diagnosisYear, setDiagnosisYear] = useState('');
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    console.log('Form Data:', {
      Gender: gender,
      'Diabetes Type': diabetesType,
      'Systolic BP': systolicBP,
      'Diastolic BP': diastolicBP,
      'HbA1c (mmol/mol)': hbA1c,
      'Estimated Avg Glucose (mg/dL)': avgGlucose,
      'Diagnosis Year': diagnosisYear,
    });
  }, [gender, diabetesType, systolicBP, diastolicBP, hbA1c, avgGlucose, diagnosisYear]);

  const handlePrediction = async () => {
    try {
      const formData = {
        'Gender': [gender],
        'Diabetes Type': [diabetesType],
        'Systolic BP': [parseFloat(systolicBP)],
        'Diastolic BP': [parseFloat(diastolicBP)],
        'HbA1c (mmol/mol)': [parseFloat(hbA1c)],
        'Estimated Avg Glucose (mg/dL)': [parseFloat(avgGlucose)],
        'Diagnosis Year': [parseInt(diagnosisYear)],
      };
      console.log('Form Data:', formData); // Logging form data for debugging

      const response = await axios.post('http://192.168.8.159:5000/predict-retinopathy', { data: formData });
      console.log('Response:', response.data); // Logging response data for debugging
      setPrediction(response.data.prediction.toString());
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error occurred while predicting retinopathy');
      Alert.alert('Error', 'An error occurred while predicting retinopathy');
    }
  };
  return (
   <View style={styles.container}>

<Text style={styles.sectionTitle}>Enter Patient Retinopathy Data</Text>
   
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Diabetes Type"
        value={diabetesType}
        onChangeText={setDiabetesType}
      />
      <TextInput
        style={styles.input}
        placeholder="Systolic BP"
        value={systolicBP}
        onChangeText={setSystolicBP}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Diastolic BP"
        value={diastolicBP}
        onChangeText={setDiastolicBP}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="HbA1c (mmol/mol)"
        value={hbA1c}
        onChangeText={setHbA1c}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Estimated Avg Glucose (mg/dL)"
        value={avgGlucose}
        onChangeText={setAvgGlucose}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Diagnosis Year"
        value={diagnosisYear}
        onChangeText={setDiagnosisYear}
        keyboardType="numeric"
      />
      <Button title="Predict Retinopathy" onPress={handlePrediction} />
      <View style={styles.predictionContainer}>
        <Text style={styles.predictionText}>Prediction: {prediction}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  predictionContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
