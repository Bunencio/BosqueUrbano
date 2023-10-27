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
  

export default function Chart() {
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
      Nombre: ${formData.Nombre}
      Correo: ${formData.Correo}
      Número celular: ${formData.Numero_celular}
      Adopciones: ${formData.Adopciones}
      Código QR: ${formData.Codigo_QR}
    `);
  
    // Si el usuario confirma, entonces se envían los datos
    if (isConfirmed) {
      axios({
        method: 'post',
        url: 'http://localhost:5000/addCliente',
        data: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log(response.data);
          setClientes([...clientes, formData]);
          setFormData({
            ID: '',
            Nombre: '',
            Correo: '',
            Numero_celular: '',
            Adopciones: '',
            Codigo_QR: '',
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
    label="Nombre" 
    name="Nombre" 
    value={formData.Nombre} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} // Ajusta el valor según tus necesidades
/>
<TextField 
    label="Correo" 
    name="Correo" 
    value={formData.Correo} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} // Ajusta el valor según tus necesidades
/>
<TextField 
    label="Número celular" 
    name="Numero_celular" 
    value={formData.Numero_celular} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} // Ajusta el valor según tus necesidades
/>

<TextField 
    label="Adopciones" 
    name="Adopciones" 
    value={formData.Adopciones} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} // Ajusta el valor según tus necesidades
/>
<TextField 
    label="Código QR" 
    name="Codigo_QR" 
    value={formData.Codigo_QR} 
    onChange={handleChange} 
    required 
    sx={{ padding: '10px 5px' }} // Ajusta el valor según tus necesidades
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
