import logo from './logo.svg';
import './App.css';
import * as XLSX from 'xlsx';
import axios from 'axios';
import React, { useState, useEffect } from 'react';



function App() {
 
  const [clientes, setClientes] = useState([]);
  const [adopciones, setAdopciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtiene datos de clientes
        const clientesResponse = await axios.get('http://localhost:5000/getClientes');
        setClientes(clientesResponse.data);

        // Obtiene datos de adopciones
        const adopcionesResponse = await axios.get('http://localhost:5000/getAdopciones');
        setAdopciones(adopcionesResponse.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      console.log(data);
      sendDataToServer(data);  // enviar los datos leídos al servidor
    };
    reader.readAsBinaryString(file);
  }
  

  const sendDataToServer = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/saveData', { data: data });
      console.log(response.data);
    } catch (error) {
      console.error('Hubo un error enviando los datos', error);
    }
  }
  

  

  return (
    <div className="App">
      
      <input type="file" onChange={handleFileChange} />
      

      <h2>Tabla Cliente</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ClienteID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Número celular</th>
            <th>Adopciones</th>
            <th>Código QR</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.Cliente_ID}>
              <td>{cliente.ID}</td>
              <td>{cliente.Nombre}</td>
              <td>{cliente.Correo}</td>
              <td>{cliente.Numero_celular}</td>
              <td>{cliente.Adopciones}</td>
              <td>{cliente.Codigo_QR}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tabla Adopción</h2>
      <table border="1">
        <thead>
          <tr>
            <th>AdopcionID</th>
            <th>ClienteID_FK</th>
            <th>QR</th>
            <th>Imagen</th>
          </tr>
        </thead>
        <tbody>
          {adopciones.map(adopcion => (
            <tr key={adopcion.AdopcionID}>
              <td>{adopcion.ID}</td>
              <td>{adopcion.Cliente_ID}</td>
              <td>{adopcion.QR}</td>
              <td><img src={adopcion.Imagen} alt="Imagen Adopción" width="100" /></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;
