const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

const db = mysql.createConnection({
  host: 'database-2.cvwiirgpxrre.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'admin1234',
  database: 'AdopcionDB'
});

app.post('/addCliente', (req, res) => {
  const cliente = req.body;

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

    console.log("Resultados de la tabla Cliente:", results);
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



app.get('/getAdopciones', (req, res) => {
  const getAdopcionesQuery = 'SELECT * FROM Adopcion';

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
