//-----------Modulos-----------//
const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');
const asyncHandler = require('express-async-handler')
const PORT = process.env.PORT || 3050
const app = express();

//const {v4: uuidv4} = require('uuid');
const uuid = require('uuid')
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//--------Coneccion-Mysql------//
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'Api'
});
//---Revision de coneccion---//
connection.connect(error => {
    if (error) throw error;
    console.log('Database server running')
});

//----------------Usuarios_----------------------_//
app.post('/Usuario', asyncHandler(async (req, res, next) => {
    var username = (req.body.usuario);
    var pass = (req.body.clave);
    console.log(username, pass)

    var querystring = 'SELECT nombre, clave from Usuario where nombre = ?';
    connection.query(querystring, [username, pass], function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
            rows.forEach(function (row) {
                console.log("Access")
                res.json({ "R": 200 })
            });
        } else {
            console.log("Error")
            res.json({ "R": 401 })
        }
    })
}));

//-------------------------------Token--------------------------------//
app.get('/obtenerToken', asyncHandler(async (req, res, next) => {
    var token = uuid.v4();
    console.log('Token enviado', token);
    return res.json({ 'R': 200, 'D': token });
}))

//--------------------Registro-Token-----------------------------//
app.post('/registrarToken', asyncHandler(async (req, res, next) => {
    var username = (req.body.USR);
    var pass = (req.body.PWD);
    var newToken = (req.body.D);

    var querystring = 'SELECT nombre,clave from Usuario where nombre = ?';
    connection.query(querystring, [username, pass], function (err, rows, fields) {
        if (err) throw err;
        if (rows.length) {
            rows.forEach(function (row) {
                res.json({ 'R': 200, 'Saved': 'XX' })
                const sqlToken = 'INSERT INTO TokenAcceso SET ?';
                var Tokenn = {
                    token: req.body.D,
                    acceso: 0,
                    generada: 0
                }
                connection.query(sqlToken, Tokenn, error => {
                    if (error) throw error;
                    console.log('Saved')
                })
            })
        } else {
            console.log("Failed")
            res.json({ 'R': 401 });
        }
    });
}));

//---------------ObtenerTrabajo----------//

app.post('/obtenerTrabajo', asyncHandler(async (req, res, next) => {
    var uid1 = (req.body.UID)
    console.log(uid1)

    validarUID(uid1);

    //-------Validacion UID------//
    function validarUID() {

        var uid2 = "SELECT Token from TokenAcceso where Token = ?"
        connection.query(uid2, [uid1], function (err, rows, fields) {
            if (err) throw err;
            res.json({ "D": 200 })
            formas()
        })

    }
    function formas() {

        //forma 1 (comprobar que este vacia la tabla Progreso)condicion 1
        mysql.query("select * from Progreso where STEP= ''", function (error, result, field) {
            if (error) {
                ultimoRegistro()
            } else if (result) { //forma 3 condicion 2
                console.log(result);
                exist(null, result);
            }
        });


    }

    //------------Ultimo registro o Tabla vacia------//
    function ultimoRegistro() {

        var UltRe_TabVac = "SELECT STEP from Progreso where STEP = ?"
        connection.query(UltRe_TabVac, [tabla], function (err, rows, fields) {
            if (err) throw err;
            var tabla = rows;
            console.log(tabla)
            var ult = tabla.pop();
            var ultD = (JSON.stringify(ult))
            var obj = JSON.parse(ultD);
            var ReT = obj['STEP']
            var conntar = (tabla.length) + 1;
            console.log(conntar)

        })

    }
    //---------------------------Llamado de funciones---------------------------------------//   
    if (conntar == 0 || ultD > 0) {
        condicion1()
    } else {
        condicion2()
    }
    //----------------------------Respuestas-------------------------------------------------//
    //----respuestas condicion 1--//
    if (condicion1 == true) {
        res.json({ "D": 200 })
    } else {
        res.json({ "D": 100 })
    }
    //----respuestas condicion 2--//
    if (condicion2 == true) {
        res.json({ "D": 200 })
    } else {
        res.json({ "D": 100 })
    }




    //---------------------Condicion_1------------------------------// 
    function condicion1() {
        var Con1 = 'SELECT STEP from Cinta where STEP = ?'
        connection.query(Con1, function (err, rows, fields) {
            if (err) throw err;
            var tabla = rows;
            console.log(tabla)
            var ult = tabla.pop();
            var ultD = (JSON.stringify(ult)) //----> Ultimo Valor
            var obj = JSON.parse(ultD);
            var ReT = obj['STEP']
            console.log(ReT)

        })
        var Con1_1 = 'SELECT VALOR from Cinta where VALOR = ?'
        connection.query(Con1_1, function (err, rows, fields) {
            if (err) throw err;
        })
        const insReg = 'INSERT INTO Progreso SET ?'
        var insReg2 = {
            STEP: null,
            STEPS: Con1_1,
            COMPLETADOS: 0
        }
        connection.query(insReg, insReg2, err => {
            if (err) {
                throw err
                console.log('saved')
            } else {
                console.log('Error')
            }
        })
        const insReg3 = 'INSERT INTO Asigna SET ?'
        var insReg4 = {
            Token: uid2,
            STEP: Con1,
            OFFSET: 0,
            UID: 0,
            RESULTADO: []
        }
        connection.query(insReg3, insReg4, err => {
            if (err) {
                throw err
                console.log('Saved')
            } else {
                console.log('Error')
            }
        })

    }
    //--------------------Condicion_2--------------------------------//
    function condicion2() {
        var Con2 = 'SELECT STEP from Asigna where STEP = ?'
        connection.query(Con1, function (err, rows, fields) {
            if (err) throw err;
            var tabla = rows;
            console.log(tabla)
            var ult = tabla.pop();
            var ultD = (JSON.stringify(ult)) //----> ultimo valor
            var obj = JSON.parse(ultD);
            var ReT = obj['STEP']
            console.log(ReT)

        })
        var Con2_1 = 'SELECT STEP from Cinta where STEP = ?'
        connection.query(Con2_1, function (err, rows, fields) {
            if (err) throw err;
        })
    }
})
);


//-----Arranque-------//
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
