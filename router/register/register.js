const express=require('express')
const app=express()
const mysql=require('mysql')
const bodyParser = require('body-parser')
var router = express.Router.Router()

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'2207',
    database:'user'
})

connection.connect()
app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

router.get('/',function(req,res){
    res.render('register')
})

router.post('/',function(req,res){
    const name = req.body.name
    const pw = req.body.pw
    var sql_insert = {name:name,pw:pw}
    connection.query('select name from user_info where name=?',[name], function(err,rows){
        if(rows.length){
            res.json({'result':'fail'})
        }
        else{
            connection.query('insert into user_info set?',sql_insert,function(err,rows){
                if(err) throw err;
                console.log('ok')
                res.json({'result':'ok'})
            })
        }
    })

})

module.exports=router