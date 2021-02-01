import React, {useState, useEffect} from 'react';
import { CSVLink, CSVDownload } from "react-csv";
import './App.css';
// import ReactDOM from 'react-dom'
// import CSVReader from 'react-csv-reader'
// const XlsxPopulate = require('xlsx-populate');
// const parse = require('csv-parse');
const Papa = require('papaparse');

function App() {
  const [files, setFiles] = useState([]);
  const [realArray, setRealArray] = useState([]);
  const [imaginaryArray, setImaginaryArray] = useState([]);

  const onFileUpload = (event) => {
    event.preventDefault();
    let fileReader = new FileReader();
    fileReader.onload = () => {
      setFiles([...event.target.files]);
      parseFiles([...event.target.files]);
    }
    fileReader.readAsDataURL(event.target.files[0]);
  }

  const parseFiles = (files) => {
    const filesData = [];
    Promise.all([...files].map(file => 
      new Promise((resolve, reject) => 
        Papa.parse(file, {
          header: false,
          complete: resolve,
          error: reject
        }),
      )),
    ).then((results) => {
      results.forEach((result, index) => {
        filesData.push(result);
      })
      //do something here
      setFiles(filesData);
      let realData = [];
      let imaginaryData = [];
      let lastFrequency = [];
      for (let i = 0; i < filesData.length; i++){
        let data = filesData[i].data;
        let frequency = ["Frequency"];
        let real = [files[i].name];
        let imaginary = [files[i].name];
        const sweepIndex = data.findIndex(element => element[0] === '[Sweep Result]');
        if(data[sweepIndex+1][2] === "Frequency"){
          for(let j = sweepIndex+2; j < data.length; j++){
            if (data[j][2] !== undefined){
              frequency.push(data[j][2]);
            }
            if (data[j][4] !== undefined){
              real.push(data[j][4])
            }
            if (data[j][5] !== undefined){
              imaginary.push(data[j][5])
            }
          }
        }
        if (realData.length === 0){
          realData.push(frequency);
          realData.push(real);
        } else if (JSON.stringify(lastFrequency) === JSON.stringify(frequency)) {
          realData.push(real);
        } else {
          realData.push(frequency);
          realData.push(real);
        }
        if (imaginaryData.length === 0){
          imaginaryData.push(frequency);
          imaginaryData.push(imaginary);
        } else if (JSON.stringify(lastFrequency) === JSON.stringify(frequency)) {
          imaginaryData.push(imaginary);
        } else {
          imaginaryData.push(frequency);
          imaginaryData.push(imaginary);
        }
        lastFrequency = [...frequency];
      }
      realData = realData[0].map((_, colIndex) => realData.map(row => row[colIndex]));
      imaginaryData =imaginaryData[0].map((_, colIndex) => imaginaryData.map(row => row[colIndex]));
      let csvReal = Papa.unparse(realData);
      let csvImaginary = Papa.unparse(imaginaryData);
      setRealArray(csvReal);
      setImaginaryArray(csvImaginary);
    }).catch((err) => console.log('something went wrong'));
  }

  const dt = new Date();

  return (
    <div>
      <header>
        Excel Merge
      </header>
      <input type="file" multiple onChange={onFileUpload}/>
      <div>Downloads</div>
      <CSVLink data={realArray} filename={`${dt.toLocaleString()}_real.csv`}>Real CSV</CSVLink>
      <div></div>
      <CSVLink data={imaginaryArray} filename={`${dt.toLocaleString()}_imaginary.csv`}>Imaginary CSV</CSVLink>

    </div>
  );
}

export default App;
