const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const multer = require('multer');
const path = require('path');
const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Configuración para recibir FormData y guardar archivos

const db = mysql.createConnection({
  host: 'database-2.cvwiirgpxrre.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'admin1234',
  database: 'AdopcionDB'
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Asegúrate de que los nombres de archivo sean únicos
  }
});

const upload = multer({ storage: storage });


app.post('/addAdopcion', upload.single('imagen'), (req, res) => {
  const clienteID_FK = req.body.clienteID_FK;
  console.log(clienteID_FK)
  const QR = req.body.QR;

  if (!req.file) {
    return res.status(400).send('No se proporcionó una imagen.');
  }

  const imagenURL = req.file.path; // Este será el path relativo de tu imagen, ej: './uploads/imagen1234.jpg'

  const sql = 'INSERT INTO Adopcion (Cliente_ID, QR, Imagen) VALUES (?, ?, ?)';
  db.query(sql, [clienteID_FK, QR, imagenURL], (err, result) => {
    // ... el resto del código sigue igual
  });
});


app.post('/addCliente', (req, res) => {
  console.log(req.headers); // para ver los encabezados de la solicitud
  console.log(req.body);    // para ver el cuerpo de la solicitud

  const cliente = req.body;
  console.log("holi", cliente)
  const sql = 'INSERT INTO Cliente (Nombre, Correo, Numero_celular, Adopciones, Codigo_QR) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [cliente.Nombre, cliente.Correo, cliente.Numero_celular, cliente.Adopciones, cliente.Codigo_QR], (err, result) => {
    if (err) {
      console.error('Error al insertar cliente:', err);
      return res.status(500).send('Error al insertar cliente.');
    }
    console.log("Cliente insertado: " + result.insertId);

    // Si tienes que agregar datos a la tabla Adopcion aquí, puedes hacerlo. Por ahora lo omito porque no se menciona en el formulario.

    res.send('Cliente insertado correctamente');
  });
});

app.post('/saveData', (req, res) => {
    const data = req.body.data;
    for (let item of data) {
      // Guardar cada fila en la base de datos
      const sql = 'INSERT INTO Cliente (Nombre, Correo, Numero_celular, Adopciones, Codigo_QR) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [item.Nombre, item.Correo, item.Numero_celular, item.Adopciones, item.Codigo_QR], (err, result) => {
        if (err) throw err;
        console.log("Cliente insertado: " + result.insertId);
  
        // Insertar en la tabla Adopcion usando el ID del cliente que acabamos de insertar
        const sqlAdopcion = 'INSERT INTO Adopcion (Cliente_ID, QR, Imagen) VALUES (?, ?, ?)';
        db.query(sqlAdopcion, [result.insertId, item.QR, item.Imagen], (err, result) => {
          if (err) throw err;
          console.log("Adopcion insertada: " + result.insertId);
        });
      });
    }
    res.send('Datos insertados correctamente');
  });

app.get('/getClientes', (req, res) => {
  const getClientesQuery = 'SELECT * FROM Cliente';

  db.query(getClientesQuery, (err, results) => {
    if (err) {
      console.error('Error al recuperar datos de Cliente:', err);
      return res.status(500).send('Error al recuperar datos de Cliente.');
    }

    
    res.json(results);
  });
});

app.put('/updateCliente/:id', (req, res) => {
  const id = req.params.id;
  const { Nombre, Correo, Numero_celular, Adopciones, Codigo_QR } = req.body;

  const updateQuery = 'UPDATE Cliente SET Nombre = ?, Correo = ?, Numero_celular = ?, Adopciones = ?, Codigo_QR = ? WHERE ID = ?';
  db.query(updateQuery, [Nombre, Correo, Numero_celular, Adopciones, Codigo_QR, id], (err, result) => {
      if (err) {
          console.error('Error al actualizar cliente:', err);
          return res.status(500).send('Error al actualizar cliente.');
      }

      console.log(`Cliente con ID ${id} actualizado.`);
      res.json({ success: true, message: `Cliente con ID ${id} actualizado exitosamente` });
      
  });
});


app.delete('/deleteCliente/:id', (req, res) => {
  const { id } = req.params;

  // Primero eliminamos las referencias en la tabla Adopcion
  const deleteAdopcionesQuery = 'DELETE FROM Adopcion WHERE Cliente_ID = ?';
  db.query(deleteAdopcionesQuery, [id], (err, result) => {
      if (err) {
          console.error('Error al eliminar adopciones relacionadas:', err);
          return res.status(500).send('Error al eliminar adopciones relacionadas.');
      }

      // Luego eliminamos el cliente
      const deleteClienteQuery = 'DELETE FROM Cliente WHERE ID = ?';
      db.query(deleteClienteQuery, [id], (err, result) => {
          if (err) {
              console.error('Error al eliminar cliente:', err);
              return res.status(500).send('Error al eliminar cliente.');
          }

          console.log(`Cliente con ID ${id} eliminado.`);
          res.send(`Cliente con ID ${id} eliminado.`);
      });
  });
});

app.delete('/deleteAdopcion/:id', (req, res) => {
  const { id } = req.params;

  // Primero eliminamos las referencias en la tabla Adopcion
  const deleteAdopcionesQuery = 'DELETE FROM Adopcion WHERE ID = ?';
  db.query(deleteAdopcionesQuery, [id], (err, result) => {
      if (err) {
          console.error('Error al eliminar adopciones relacionadas:', err);
          return res.status(500).send('Error al eliminar adopciones relacionadas.');
      }

     

          console.log(`Cliente con ID ${id} eliminado.`);
          res.send(`Cliente con ID ${id} eliminado.`);
      });
  });



app.get('/getAdopciones', (req, res) => {
  const getAdopcionesQuery = `
    SELECT Adopcion.*, Cliente.Nombre AS NombreCliente 
    FROM Adopcion 
    JOIN Cliente ON Adopcion.Cliente_ID = Cliente.ID
  `;

  db.query(getAdopcionesQuery, (err, results) => {
    if (err) {
      console.error('Error al recuperar datos de Adopcion:', err);
      return res.status(500).send('Error al recuperar datos de Adopcion.');
    }

    console.log("Resultados de la tabla Adopcion:", results);
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log('Servidor corriendo en el puerto 5000');
});

