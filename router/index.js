const express=require('express')
const app=express()
var router = express.Router()
const mysql=require('mysql')
const bodyParser = require('body-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session)
const upload = require('../config/multer')

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: 'my key',
    resave: false,
    saveUninitialized:true,
    store: sessionStore
}))

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'2207',
    database:'user'
})
var options = {
    host:'localhost',
    user:'root',
    password:'2207',
    database:'user'
}
var sessionStore = new MySQLStore(options)
connection.connect()



router.get('/',(req,res)=>{
    console.log('메인페이지 작동');
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
    console.log('로그인');
    res.render('new_login');
});

router.post('/login',(req,res)=>{
    const body = req.body;
    //console.log(body);
    const id = body.id;
    const pw = body.pw;

    connection.query('select * from userdata where id=?',[id],(err,data)=>{
        // 로그인 확인
        console.log('data객체',data);
        console.log('data길이',data.length);
        if(data.length>0){
            if(id == data[0].id && pw == data[0].pw){
                console.log('로그인 성공');
                // 세션에 추가
                req.session.is_logined  = true;
                req.session.name = data[0].name;
                req.session.ID = data[0].id;
                req.session.pw = data[0].pw;

                req.session.save(function(){ // 세션 스토어에 적용하는 작업
                    res.render('main',{ // 정보전달
                        name : data[0].name,
                        ID : data[0].id,
                        age : data[0].age,
                        is_logined : true
                    });
                });
            }
            else{
                req.session.is_logined  = false;
                console.log('비밀번호가 틀립니다.');
                req.session.save(function(){ // 세션 스토어에 적용하는 작업
                    /*res.render('login',{ // 정보전달*/
                    is_logined : false
                    /*});*/
                    res.send("<script>alert('ID or password is wrong..');  location.href='/login';</script>");
                });

            }
        }
        else{
            req.session.is_logined  = false;
            
            console.log('로그인 실패');
            req.session.save(function(){ // 세션 스토어에 적용하는 작업
                //res.render('login',{ // 정보전달
                    is_logined : false
                //});
                res.send("<script>alert('ID or password is wrong..');  location.href='/login';</script>");
            });
        }
    });
});

router.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('new_register');
});

router.post('/register',(req,res)=>{
    console.log('회원가입 하는중')
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    const age = body.age;

    connection.query('select * from userdata where id=?',[id],(err,data)=>{
        console.log(data.length);
        if(data.length == 0){
            console.log('회원가입 성공');
            connection.query('insert into userdata(id, name, age, pw) values(?,?,?,?)',[
                id, name, age, pw
            ]);
            res.redirect('/');
        }else{
            console.log('회원가입 실패');
            res.send("<script>alert('There are overlapping IDs.');  location.href='/register';</script>");
        }
    });
});

router.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});

router.get('/show',(req,res)=>{
    if(req.session.is_logined  == true){
        console.log('화상상담');
        req.session.save(function(){ // 세션 스토어에 적용하는 작업
            res.render('index',{ // 정보전달
                name : req.session.name,
                ID : req.session.ID,
                age : req.session.age,
                is_logined : true
            });
        });
    }else{
        console.log('로그인이 필요합니다.');
        res.send("<script>alert('Service that requires login.');  location.href='/login';</script>");
    }
});

router.post('/image', upload.single("image"), function(req, res, next) {
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
    console.log('마이페이지');
    var sql = "select idx, userName, doctorName, reason,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where userID=?"

    connection.query(sql,req.session.ID,function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){ // 세션 스토어에 적용하는 작업
            res.render('mypage',{ // 정보전달
                title: '게시판 리스트',
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
    console.log('차트');
    req.session.save(function(){ // 세션 스토어에 적용하는 작업
        res.render('charts',{ // 정보전달
            name : req.session.name,
            ID : req.session.ID,
            age : req.session.age,
            is_logined : true
        });
    });
});

router.get('/tables',(req,res)=>{
    console.log('테이블');
    var page = req.params.page;
    var sql = "select idx, userName, doctorName, reason,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where userID=?"

    connection.query(sql,req.session.ID,function (err, rows) {
        if (err) console.error("err : " + err);
        req.session.save(function(){ // 세션 스토어에 적용하는 작업
            res.render('tables',{ // 정보전달
                title: '게시판 리스트',
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
    var idx = req.params.idx;
    var sql = "select idx, userName, doctorName, reason, content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from consulting where idx=?";
    connection.query(sql,[idx], function(err,row)
    {
        if(err) console.error(err);
        req.session.save(function(){
            res.render('update', {
                title:"글 상세", 
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
    var idx = req.body.idx;
    var reason = req.body.reason;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [reason,content,idx,passwd];
    console.log(datas)
    //지금 인덱스 받아오게끔 만들어야 함.
    var sql = "update consulting set reason=?, content=? where idx=? and passwd=?";
    connection.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
        }
        else
        {
            res.redirect("/tables");
        }
    });
});

router.get('/write', function(req,res,next){
    res.render('write',{title : "게시판 글 쓰기"});
});

router.post('/write', function(req,res,next){
    var userID = req.body.userID;
    var doctorID = req.body.doctorID;
    var reason = req.body.reason;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [userID,doctorID,userID,doctorID,reason,content,passwd];

    console.log(datas);
    //중요: 여기서 이름하고 ID 받아오는; 방법 생각해야 함.
    var sql = "insert into consulting(userID, doctorID,userName,doctorName, reason, content, regdate, passwd,hit) values(?,?,?,?,?,?,now(),?,0);";
    connection.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/tables');
    });
});

router.get('/delete/:idx',function(req,res,next)
{
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
    var idx = req.body.idx;
    var passwd = req.body.passwd;
    var datas = [idx,passwd];

    var sql = "delete from consulting where idx=? and passwd=?";
    connection.query(sql,datas, function(err,result)
    {
        if(err) console.error(err);
        if(result.affectedRows == 0)
        {
            res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
        }
        else
        {
            res.redirect('/tables');
        }
    });
});

router.get('/media',(req,res)=>{
    var sql = "select idx, title, link, registrant, category ,recommend,content, date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from eduboard"

    console.log('교육영상');
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
    console.log('교육영상 추가');
    req.session.save(function(){
        res.render('add-media',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.post('/addmedia', function(req,res,next){
    var title = req.body.title;
    var registrant = req.body.registrant;
    var category = req.body.category;
    var recommend = req.body.recommend;
    var content = req.body.content;
    var link = req.body.link;
    var datas = [title,link,registrant,category,content,recommend];

    console.log(datas);
    //중요: 여기서 이름하고 ID 받아오는; 방법 생각해야 함.
    var sql = "insert into eduboard(title, link, registrant, category, content, recommend , regdate) values(?,?,?,?,?,?,now());";
    connection.query(sql,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/media');
    });
});

router.get('/mediapage',(req,res)=>{
    console.log('교육영상');
    req.session.save(function(){
        res.render('media-page',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

router.get('/missionpage',(req,res)=>{
    console.log('교육영상');
    req.session.save(function(){ 
        res.render('missionList',{
            name : req.session.name,
            ID : req.session.ID,
            is_logined : true
        });
    });
});

module.exports=router