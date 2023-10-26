import React, { useState } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import Title from './Title';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import '../App.css'

const useStyles = makeStyles((theme) => ({
    customButton: {
      backgroundColor: '#007BFF',
      color: 'white',
      padding: '10px 20px',
      '&:hover': {
        backgroundColor: '#0056b3',
      },
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
      borderRadius: '5px',
    },
  }));
  

export default function UploadEvidence() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    ID: '',
    Nombre: '',
    Correo: '',
    Numero_celular: '',
    Adopciones: '',
    Codigo_QR: '',
  });
  const classes = useStyles();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Mostrar un cuadro de diálogo de confirmación con los datos ingresados
    const isConfirmed = window.confirm(`
      ¿Estás seguro de agregar el siguiente cliente?
      Cliente ID FK: ${formData.clienteID_FK}
      QR: ${formData.QR}
    `);
  
    if (isConfirmed) {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }

      axios.post('http://localhost:5000/addAdopcion', data)
        .then(response => {
          console.log(response.data);
          setClientes([...clientes, formData]);
          setFormData({
            clienteID_FK: '',
            QR: '',
            imagen: null
          });
        })
        .catch(error => {
          console.error('Hubo un error enviando los datos', error);
        });
    }
};

  

  return (
    <React.Fragment>
        <Title>Agregar Cliente</Title>
        <div >
      <form onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>

      <TextField 
    label="Cliente ID FK" 
    name="clienteID_FK" 
    value={formData.clienteID_FK} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} 
/>

<TextField 
    label="QR" 
    name="QR" 
    value={formData.QR} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} 
/>

<input 
    type="file" 
    name="imagen" 
    onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })} 
    sx={{ padding: '10px 5px' }} 
/>

       

            <Button 
                type="submit" 
                sx={{ 
                    backgroundColor: '#007BFF',
                    color: 'white',
                    padding: '10px 20px 10px',
                    '&:hover': {
                        backgroundColor: '#0056b3',
                    },
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                    borderRadius: '105px',
                }}
            >
                Agregar
            </Button>


       
      </form>
      </div>
      
    </React.Fragment>
  );
}
