const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const path = require('path');
require ('dotenv').config()

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


var corsOptions = {
  origin: [
    'http://localhost:5262', 
    'http://localhost:2710', 
    'https://impactaterritorios.adece.ce.gov.br',
    'http://impactaterritorios.adece.ce.gov.br',
  ],
  credentials: true,
  methods: ['GET', 'PUT', 'POST','PATCH', 'DELETE'],
  allowedHeaders: ["Content-Type", "Authorization"],
  };
  
app.use(cors(corsOptions));

routes(app)

const port = Number(process.env.API_PORT || 2526)

app.listen(port, () => console.log(`O servidor está On ${port}`));

module.exports = app