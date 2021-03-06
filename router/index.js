const express=require('express')
const app=express()
var router = express.Router()
const mysql=require('mysql')
const bodyParser = require('body-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session)
const upload = require('../config/multer')
require('dotenv').config();

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: 'my key',
    resave: false,
    saveUninitialized:true,
}))

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
})

function handleDisconnect() {
    connection.connect(function(err) {            
      if(err) {                            
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); 
      }                                   
    });
                                           
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
        return handleDisconnect();                      
      } else {                                    
        throw err;                              
      }
    });
  }
  
handleDisconnect();

//DB Server connecting error block, Send queries to the server every 5 seconds.
setInterval(function () { connection.query('SELECT 1'); }, 5000);


router.get('/',(req,res)=>{
    //main page loading
    console.log(req.session);
    if(req.session.is_logined  == true){
        res.render('main',{
            is_logined  : req.session.is_logined ,
            name : req.session.name,
            ID : req.session.ID
        });
    }else{
        res.render('main',{
            is_logined  : false
        });
    }
});

router.get('/login',(req,res)=>{
    //login page loading
    res.render('new_login');
});

router.post('/login',(req,res)=>{
    //login info check
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    connection.query('select * from userdata where id=?',[id],(err,data)=>{
        if(data.length>0){
            if(id == data[0].id && pw == data[0].pw){
                console.log('????????? ??????');
                req.session.is_logined  = true;
                req.session.name = data[0].name;
                req.session.ID = data[0].id;
                req.session.pw = data[0].pw;

                req.session.save(function(){
                    res.render('main',{
                        name : data[0].name,
                        ID : data[0].id,
                        age : data[0].age,
                        is_logined : true
                    });
                });
            }
            else{
                //if password is wrong,
                req.session.is_logined  = false;
                console.log('??????????????? ????????????.');
                req.session.save(function(){
                    is_logined : false
                    res.send("<script>alert('ID or password is wrong..');  location.href='/login';</script>");
                });

            }
        }
        else{
            req.session.is_logined  = false;
            
            console.log('????????? ??????');
            req.session.save(function(){
                    is_logined : false
                res.send("<script>alert('ID or password is wrong..');  location.href='/login';</script>");
            });
        }
    });
});

router.get('/register',(req,res)=>{
    //user register page loading
    res.render('new_register');
});

router.post('/register',(req,res)=>{
    //user register info check
    console.log('???????????? ?????????')
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    const age = body.age;

    connection.query('select * from userdata where id=?',[id],(err,data)=>{
        console.log(data.length);
        if(data.length == 0){
            console.log('???????????? ??????');
            connection.query('insert into userdata(id, name, age, pw) values(?,?,?,?)',[
                id, name, age, pw
            ]);
            res.redirect('/');
        }else{
            console.log('???????????? ??????');
            res.send("<script>alert('There are overlapping IDs.');  location.href='/register';</script>");
        }
    });
});

router.get('/logout',(req,res)=>{
    //logout Page loading
    req.session.destroy(function(err){
        res.redirect('/');
    });

});

router.get('/show',(req,res)=>{
    //web chat page loading
    if(req.session.is_logined  == true){
        req.session.save(function(){
            res.render('index',{
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true
            });
        });
    }else{
        console.log('???????????? ???????????????.');
        res.send("<script>alert('Service that requires login.');  location.href='/login';</script>");
    }
});

router.post('/image', upload.single("image"), function(req, res, next) {
    //web chat page, send image to the s3 server
    try {
        console.log(req.file);
    
        var data = req.file;
        res.send(data.location);
  
    } catch (error) {
        //console.log(error);
        console.error(error);
        next(error);
    }
});

router.get('/mypage',(req,res)=>{
    //mypage loading
    var sql = "select idx, userName, doctorName, reason,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where userID=?"

    connection.query(sql,req.session.ID,function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){
            res.render('mypage',{
                title: '????????? ?????????',
                rows: rows,
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true
            });
        });
    });
});


router.get('/charts',(req,res)=>{
    //chart page loading
    req.session.save(function(){
        res.render('charts',{
            name : req.session.name,
            ID : req.session.ID,
            age : req.session.age,
            is_logined : true
        });
    });
});

router.get('/tables',(req,res)=>{
    //table page loading
    var page = req.params.page;
    var sql = "select idx, userName, doctorName, reason,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where userID=?"

    connection.query(sql,req.session.ID,function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){
            res.render('tables',{
                title: '????????? ?????????',
                rows: rows,
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true
            });
        });
    });
});

router.get('/update/:idx',function(req,res,next)
{
    //table update page loading
    var idx = req.params.idx;
    var sql = "select idx, userName, doctorName, reason, content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where idx=?";
    connection.query(sql,[idx], function(err,row)
    {
        if(err) console.error(err);
        req.session.save(function(){
            res.render('update', {
                title:"??? ??????", 
                rows: row[0],
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true,
                idx : req.params.idx
            });
        });
    });
});

router.post('/update',function(req,res,next)
{
    //table update info send to DB(mysql) server
    var idx = req.body.idx;
    var reason = req.body.reason;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [reason,content,idx,passwd];
    console.log(datas)
    var sql = "update consulting set reason=?, content=? where idx=? and passwd=?";
    connection.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('??????????????? ???????????? ????????????.');history.back();</script>");
        }
        else
        {
            res.redirect("/tables");
        }
    });
});

router.get('/write', function(req,res,next){
    //write page page loading
    res.render('write',{title : "????????? ??? ??????"});
});

router.post('/write', function(req,res,next){
    //write consulting log in board 
    var userID = req.body.userID;
    var doctorID = req.body.doctorID;
    var reason = req.body.reason;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [userID,doctorID,userID,doctorID,reason,content,passwd];

    var sql = "insert into consulting(userID, doctorID,userName,doctorName, reason, content, regdate, passwd,hit) values(?,?,?,?,?,?,now(),?,0);";
    connection.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/tables');
    });
});

router.get('/delete/:idx',function(req,res,next)
{
    //loading consulting details page
    var idx = req.params.idx;
    var sql = "select idx, userName, doctorName, reason, content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where idx=?";
    connection.query(sql,[idx], function(err,row)
    {
        if(err) console.error(err);
        req.session.save(function(){
            res.render('delete', {
                rows: row[0],
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true,
                idx : req.params.idx
            });
        });
    });
});


router.post('/delete',function(req,res,next)
{
    //delete consulting log
    var idx = req.body.idx;
    var passwd = req.body.passwd;
    var datas = [idx,passwd];

    var sql = "delete from consulting where idx=? and passwd=?";
    connection.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('??????????????? ???????????? ????????????.');history.back();</script>");
        }
        else
        {
            res.redirect('/tables');
        }
    });
});

router.get('/media',(req,res)=>{
    //load a eduation media clip list page
    var sql = "select idx, title, link, registrant, category ,recommend,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from eduboard"

    console.log('????????????');
    connection.query(sql,function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){
            res.render('edumedia',{
                rows: rows,
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true
            });
        });
    });
});

router.get('/addmedia',(req,res)=>{
    //load a Add educational video page.
    console.log('???????????? ??????');
    req.session.save(function(){
        res.render('add-media',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.post('/addmedia', function(req,res,next){
    //Add educational video
    var title = req.body.title;
    var registrant = req.body.registrant;
    var category = req.body.category;
    var recommend = req.body.recommend;
    var content = req.body.content;
    var link = req.body.link;
    var datas = [title,link,registrant,category,content,recommend];

    var sql = "insert into eduboard(title, link, registrant, category, content, recommend , regdate) values(?,?,?,?,?,?,now());";
    connection.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/media');
    });
});

router.get('/mediapage',(req,res)=>{
    req.session.save(function(){
        res.render('media-page',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.get('/mediapage/:idx',function(req,res,next)
{
    //Load educational video detail page.
    var idx = req.params.idx;
    var sql = "select idx, title, link, registrant, category , recommend,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from eduboard where idx=?";
    connection.query(sql,[idx], function(err,row)
    {   
        if(err) console.error(err);
        var thumbnailURL = row[0].link.split('=');
        var recommendList = row[0].recommend.split(',');
        req.session.save(function(){
            res.render('media-page', {
                rows: row[0],
                thumbnail: thumbnailURL[1],
                recommendList: recommendList,
                name : req.session.name,
                ID : req.session.ID,
                is_logined : true,
                idx : req.params.idx
            });
        });
    });
});

router.get('/missionpage',(req,res)=>{
    //Load a mission page
    req.session.save(function(){ 
        res.render('missionList',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.get('/missionpage/:idx',function(req,res,next)
{
    //Load a mission page per each user
    var idx = req.params.idx;
    var sql = "select idx, mission, content, success from missionList where userID=? and regdate=?";
    connection.query(sql,[req.session.ID,idx], function(err,rows)
    {
        if(err) console.error(err);
        req.session.save(function(){
            res.render('missionList', {
                rows: rows,
                name : req.session.name,
                ID : req.session.ID,
                is_logined : true,
                idx : req.params.idx
            });
        });
    });
});

router.post('/missioncheck', function(req,res,next){
    //send a mission check sign to the DB
    var idx = req.body.idx;
    var datas = [true,idx];
    var sql = "update missionList set success=? where idx=?";
    connection.query(sql,datas, function(err,rows)
    {
        if(err) console.error(err);
        req.session.save(function(){
            res.render('calendar', {
                name : req.session.name,
                ID : req.session.ID,
                is_logined : true,
            });
        });
    });
});

router.post('/addmission', function(req,res,next){
    //send a add mission command to the DB
    var doctorID = req.body.doctorID;
    var userName = req.body.userName;
    var userID = req.body.userID;
    var mission = req.body.mission;
    var content = req.body.content;
    var regdate = req.body.regdate;
    var success = req.body.success
    var datas = [userName,userID,doctorID,mission,content,success,regdate];

    var sql = "insert into missionList(userName, userID, doctorID, mission, content, success, regdate) values(?,?,?,?,?,?,?);";
    connection.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/missionCalendar');
    });
});

router.get('/missionCalendar',(req,res)=>{
    //Load a mission calendar
    req.session.save(function(){
        res.render('calendar',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.get('/care',(req,res)=>{
    //load a Patient care page for doctor
    var sql = 'select missionList.userID, missionList.userName, round(count(case when missionList.success=1 then 1 end)/count(missionList.success)*100,1) as per from missionList where missionList.doctorID = ? group by missionList.userID order by missionList.userID DESC;'
    //and missionList.regdate > ? and missionList.regdate <= ? 
    var doctorID = req.session.ID;
    var today = new Date();
    let year = today.getFullYear(); // ??????
    let month = today.getMonth() + 1;  // ???
    if(month<10){
        month = "0"+String(month);
    }
    else{
        month=String(month);
    }

    let monthStart = year+ month+"00";
    let monthEnd = year+ month+"31";
    datas = [doctorID];
    connection.query(sql, datas ,function(err,rows)
    {
        console.log(rows[0]);
        if(err) console.error(err);
        req.session.save(function(){
            res.render('care', {
                rows : rows,
                name : req.session.name,
                ID : req.session.ID,
                is_logined : true,
            });
        });
    });
});

router.get('/caredetail/:id',(req,res)=>{
    //load a care each patient's detail page for doctor
    var userID = req.params.id;
    var sql = "select userID, userName, mission, content, success, date_format(regdate,'%Y-%m-%d') regdate from missionList where userID=? and doctorID=?"

    connection.query(sql,[userID,req.session.ID], function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){ // ?????? ???????????? ???????????? ??????
            res.render('caredetail',{ // ????????????
                title: '????????? ?????????',
                rows: rows,
                name : req.session.name,
                ID : req.session.ID,
                is_logined : true
            });
        });
    });
});

module.exports=router