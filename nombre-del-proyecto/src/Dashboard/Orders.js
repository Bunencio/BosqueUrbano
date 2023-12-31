import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import Title from './Title';
import axios from 'axios';
import * as XLSX from 'xlsx';
import React, { useState, useEffect } from 'react';
import { TableContainer } from '@mui/material';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';


export default function App() {
  const [clientes, setClientes] = useState([]);
  const [adopciones, setAdopciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // Nuevo estado
  const [openModal, setOpenModal] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);
  const [open, setOpen] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const [modalData, setModalData] = useState({ Nombre: '', Correo: '' });
  
  const handleOpenImageModal = (url) => {
    setImageURL(url);
    setOpen(true); // Asume que ya tienes un estado llamado "open" para manejar la apertura/cierre del modal
  };
  
  const handleOpenImageModal2 = (relativeUrl) => {
    // Convertir la URL relativa en una URL completa.
    const fullUrl = `http://localhost:5000/${relativeUrl}`;
    setImageURL(fullUrl);
    setOpen(true);
};


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

  const handleEdit = (cliente) => {
    setModalData(cliente); // Establece los datos del cliente en modalData
    setOpenModal(true); // Abre el modal
    console.log("Editando cliente con ID:", cliente.ID); // Añade esta línea para depurar
    const updatedCliente = {
        // Aquí irán los datos actualizados del cliente que se obtienen del formulario.
        // Por simplicidad, estoy usando los datos originales.
        Nombre: cliente.Nombre,
        Correo: cliente.Correo,
        Numero_celular: cliente.Numero_celular,
        Adopciones: cliente.Adopciones,
        Codigo_QR: cliente.Codigo_QR
    };

    axios.put(`http://localhost:5000/updateCliente/${cliente.ID}`, updatedCliente)
        .then(response => {
            console.log(response.data);
            // Aquí puedes actualizar el estado 'clientes' para reflejar los cambios sin tener que hacer otra llamada al servidor.
        })
        .catch(error => console.error("Error al editar cliente:", error));
}



const handleDelete = (id) => {
      console.log("Eliminando cliente con ID:", id); // Añade esta línea para depurar
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        axios.delete(`http://localhost:5000/deleteCliente/${id}`)
            .then(response => {
                console.log(response.data);
                // Actualizar el estado 'clientes' para eliminar el cliente del frontend.
                setClientes(prevClientes => prevClientes.filter(cliente => cliente.Cliente_ID !== id));
            })
            .catch(error => console.error("Error al eliminar cliente:", error));
    }
}

const handleDeleteAdopcion = (id) => {
  console.log("Eliminando adopción con ID:", id); 
  if (window.confirm("¿Estás seguro de que deseas eliminar esta adopción?")) {
      axios.delete(`http://localhost:5000/deleteAdopcion/${id}`)
          .then(response => {
              console.log(response.data);
              // Update 'adopciones' state to remove the adoption from frontend.
              setAdopciones(prevAdopciones => prevAdopciones.filter(adopcion => adopcion.Adopcion_ID !== id));
          })
          .catch(error => console.error("Error al eliminar adopción:", error));
  }
}


const handleClose = () => {
  setOpenModal(false);
};

const handleSave = () => {
  // Verifica que modalData contenga toda la información necesaria
  if (!modalData || !modalData.ID) {
      console.error('Datos incompletos');
      return;
  }

  // Enviar solicitud PUT al servidor para actualizar el cliente
  axios.put(`http://localhost:5000/updateCliente/${modalData.ID}`, modalData)
      .then(response => {
          console.log(response.data);

          // Actualizar el estado 'clientes' con los datos modificados
          const updatedClientes = clientes.map(cliente =>
              cliente.ID === modalData.ID ? modalData : cliente
          );
          setClientes(updatedClientes);

          // Cierra el modal
          setOpenModal(false);
      })
      .catch(error => {
          console.error("Error al editar cliente:", error);
          // Aquí puedes mostrar un mensaje al usuario sobre el error si lo deseas
      });
};


const adopcionesConLinkExterno = adopciones.filter(adopcion => adopcion.Imagen && adopcion.Imagen.startsWith('http'));
const adopcionesConUploads = adopciones.filter(adopcion => adopcion.Imagen && adopcion.Imagen.startsWith('uploads'));


const ModalStyle = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}));

const rows = filteredClientes.map(cliente => ({
  id: cliente.Cliente_ID,
  ClienteID: cliente.ID,
  Nombre: cliente.Nombre,
  Correo: cliente.Correo,
  NumeroCelular: cliente.Numero_celular,
  Adopciones: cliente.Adopciones,
  CodigoQR: cliente.Codigo_QR,
}));

console.log(rows)

const columns = [
  { field: 'ClienteID', headerName: 'ClienteID', width: 150 },
  { field: 'Nombre', headerName: 'Nombre', width: 200 },
  { field: 'Correo', headerName: 'Correo', width: 200 },
  {
    field: 'NumeroCelular',
    headerName: 'Número celular',
    width: 200,
    renderCell: (params) => (
      <a href={`https://wa.me/52${params.value}`} target="_blank" rel="noopener noreferrer">
        {params.value}
      </a>
    ),
  },
  { field: 'Adopciones', headerName: 'Adopciones', width: 150 },
  { field: 'CodigoQR', headerName: 'Código QR', width: 200 },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 250,
    renderCell: (params) => (
      <>
        <Button onClick={() => handleEdit(params.row)}>Editar</Button>
        <Button onClick={() => handleDelete(params.row.ClienteID)}>Eliminar</Button>
      </>
    ),
  },
];

console.log(columns)

  return (
    
    <React.Fragment>
<Modal
  open={openModal}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,  // Puedes ajustar este valor según necesites
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
    }}
  >
    <Paper style={{ width: '500px', padding: '20px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <h2 id="modal-modal-title">Editar Cliente</h2>
      {/* Aquí va el contenido de tu modal */}
      {/* Por ejemplo, el formulario para editar */}
      <TextField label="Nombre" defaultValue={modalData.Nombre} fullWidth variant="outlined" margin="normal" />
      <TextField label="Correo" defaultValue={modalData.Correo} fullWidth variant="outlined" margin="normal" />
      <TextField label="Numero_celular" defaultValue={modalData.Numero_celular} fullWidth variant="outlined" margin="normal" />
      <TextField label="Adopciones" defaultValue={modalData.Adopciones} fullWidth variant="outlined" margin="normal" />
      <TextField label="Codigo_QR" defaultValue={modalData.Codigo_QR} fullWidth variant="outlined" margin="normal" />
      {/* Continúa con otros campos y botones según necesites */}
      <Button onClick={handleSave} variant="contained" color="primary">
          Guardar Cambios
      </Button>

    </Paper>
  </Box>
</Modal>

<Modal
  open={open}
  onClose={() => setOpen(false)}
  aria-labelledby="image-modal-title"
  aria-describedby="image-modal-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
    }}
  >
    {imageURL && <img src={imageURL} alt="Adopción" style={{ maxWidth: '90%', maxHeight: '90%' }} />}
  </Box>
</Modal>

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
                <TableCell>Acciones</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {filteredClientes.map(cliente => (   // Usa 'filteredClientes' en lugar de 'clientes'
                <TableRow key={cliente.Cliente_ID}>
                    <TableCell>{cliente.ID}</TableCell>
                    <TableCell>{cliente.Nombre}</TableCell>
                    <TableCell>{cliente.Correo}</TableCell>
                    <TableCell>
                      <a href={`https://wa.me/52${cliente.Numero_celular}`} target="_blank" rel="noopener noreferrer">
                        {cliente.Numero_celular}
                      </a>
                    </TableCell>

                    <TableCell>{cliente.Adopciones}</TableCell>
                    <TableCell>{cliente.Codigo_QR}</TableCell>
                    
                    <TableCell>
                    <Button onClick={() => handleEdit(cliente)}>Editar</Button>
                    <Button onClick={() => handleDelete(cliente.ID)}>Eliminar</Button>

                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>
<TableContainer style={{ maxHeight: '300px' }}>
      <Title>Tabla Adopción</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>AdopcionID</TableCell>
            <TableCell>ClienteID</TableCell>
            <TableCell>Nombre del Cliente</TableCell>
            <TableCell>QR</TableCell>
            <TableCell>Imagen</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
               
        {adopcionesConLinkExterno.map(adopcion => (
            <TableRow key={adopcion.AdopcionID}>
              <TableCell>{adopcion.ID}</TableCell>
              <TableCell>{adopcion.Cliente_ID}</TableCell>
              <TableCell>{adopcion.NombreCliente}</TableCell>
              <TableCell>{adopcion.QR}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenImageModal(adopcion.Imagen)}>Ver Imagen</Button>
              </TableCell>
              <Button onClick={() => handleDeleteAdopcion(adopcion.ID)}>Eliminar</Button>
            </TableRow>
        ))}

       
        {adopcionesConUploads.map(adopcion => (
            <TableRow key={adopcion.AdopcionID}>
              <TableCell>{adopcion.ID}</TableCell>
              <TableCell>{adopcion.Cliente_ID}</TableCell>
              <TableCell>{adopcion.NombreCliente}</TableCell>
              <TableCell>{adopcion.QR}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenImageModal2(adopcion.Imagen)}>Ver Imagen</Button>
              </TableCell>
              <Button onClick={() => handleDeleteAdopcion(adopcion.ID)}>Eliminar</Button>
            </TableRow>
        ))}

        </TableBody>
      </Table>

      </TableContainer>
    </React.Fragment>
  );
}
