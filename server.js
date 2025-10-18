const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',    
  password: '123',
  database: 'tienda',
   port: 3306  
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conexión a MySQL exitosa ✅');
});

app.listen(3000, () => {
  console.log('Servidor backend corriendo en http://localhost:3000');
});

app.post('/ordenes', (req, res) => {
  const {
    nombre,
    direccion,
    correo,
    telefono,
    tarjeta,
    vencimiento,
    ccv,
    subtotal,
    envio,
    total,
    productos
  } = req.body;

  const sql = `
    INSERT INTO Orden 
    (nombreCliente, direccion, correo, telefono, tarjeta, fechaVencimiento, ccv, subtotal, envio, total, productos) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nombre, direccion, correo, telefono, tarjeta, vencimiento, ccv, subtotal, envio, total, JSON.stringify(productos)],
    (err, result) => {
      if (err) {
        console.error('Error al guardar la orden:', err);
        res.status(500).json({ error: 'Error al guardar la orden' });
      } else {
        res.json({ message: 'Orden guardada exitosamente', idOrden: result.insertId });
      }
    }
  );
});

// -------------------- RUTAS DE PRODUCTOS --------------------
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM Producto', (err, results) => {
    if (err) return res.status(500).send('Error en la consulta');
    res.json(results);
  });
});

app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, idEstadoProducto, imagen } = req.body;
  const sql = `INSERT INTO Producto (nombre, descripcion, precio, stock, idEstadoProducto, imagen) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [nombre, descripcion, precio, stock, idEstadoProducto, imagen], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto agregado', idProducto: result.insertId });
  });
});

app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, idEstadoProducto, imagen } = req.body;
  const sql = `UPDATE Producto SET nombre=?, descripcion=?, precio=?, stock=?, idEstadoProducto=?, imagen=? WHERE idProducto=?`;
  db.query(sql, [nombre, descripcion, precio, stock, idEstadoProducto, imagen, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado' });
  });
});

app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM Producto WHERE idProducto=?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado' });
  });
});
