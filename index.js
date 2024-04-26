const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const route = require('./routes/users.route')
const adminRoute = require('./routes/adminRoute.route')

app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api', route);
console.log('hello......');

app.use('/api/admin',adminRoute);
console.log('hello admin api');

app.use('/file',express.static('file'));


mongoose.connect('mongodb://127.0.0.1:27017/crudAngular')
    .then(() => {
        console.log('Database connected...');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

app.listen(5000, () => {
    console.log('App is listening on port 5000');
});
