import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import Title from './Title';
import axios from 'axios';
import * as XLSX from 'xlsx';
import React, { useState, useEffect } from 'react';
import { TableContainer } from '@mui/material';

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [adopciones, setAdopciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // Nuevo estado

  const filteredClientes = clientes.filter(cliente =>
    cliente.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
    // Agrega más condiciones si deseas buscar en más campos, por ejemplo:
    // || cliente.Correo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesResponse = await axios.get('http://localhost:5000/getClientes');
        setClientes(clientesResponse.data);

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
    
    // Confirmación para cargar el archivo
    if(!window.confirm("¿Estás seguro de que deseas cargar este archivo de Excel?")) {
      return;  // Si el usuario no confirma, se detiene la ejecución
    }
  
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      sendDataToServer(data);
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
    <React.Fragment>
      <Title>Upload Excel</Title>
      <input type="file" onChange={handleFileChange} />

      <Title>Tabla Cliente</Title>
<TextField
    label="Buscar Cliente"
    variant="outlined"
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    style={{ marginBottom: '20px' }}
/>
<TableContainer style={{ maxHeight: '300px' }}>
    <Table size="small">
        <TableHead>
            <TableRow>
                <TableCell>ClienteID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Número celular</TableCell>
                <TableCell>Adopciones</TableCell>
                <TableCell>Código QR</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {filteredClientes.map(cliente => (   // Usa 'filteredClientes' en lugar de 'clientes'
                <TableRow key={cliente.Cliente_ID}>
                    <TableCell>{cliente.ID}</TableCell>
                    <TableCell>{cliente.Nombre}</TableCell>
                    <TableCell>{cliente.Correo}</TableCell>
                    <TableCell>{cliente.Numero_celular}</TableCell>
                    <TableCell>{cliente.Adopciones}</TableCell>
                    <TableCell>{cliente.Codigo_QR}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>

      <Title>Tabla Adopción</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>AdopcionID</TableCell>
            <TableCell>ClienteID_FK</TableCell>
            <TableCell>QR</TableCell>
            <TableCell>Imagen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {adopciones.map(adopcion => (
            <TableRow key={adopcion.AdopcionID}>
              <TableCell>{adopcion.ID}</TableCell>
              <TableCell>{adopcion.Cliente_ID}</TableCell>
              <TableCell>{adopcion.QR}</TableCell>
              <TableCell><img src={adopcion.Imagen} alt="Imagen Adopción" width="100" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
