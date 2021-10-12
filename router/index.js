const express=require('express')
const app=express()
var router = express.Router()
const mysql=require('mysql')
const bodyParser = require('body-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session)

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
            name : req.session.name
        });
    }else{
        res.render('main',{
            is_logined  : false
        });
    }
    console.log('login상태:',req.session.is_logined);
});

router.get('/login',(req,res)=>{
    console.log('로그인 작동');
    //res.render('login');
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
        /*console.log('data객체',data);
        console.log('data[0]',data[0]);
        console.log('입력 id : ',id);
        console.log('서버 id',data[0].id);
        console.log(data[0].pw);
        console.log(id == data[0].id);
        console.log(pw == data[0].pw);*/
        /*if(err){
            throw err
        }*/
        if(data.length>0){
            if(id == data[0].id && pw == data[0].pw){
                console.log('로그인 성공');
                // 세션에 추가
                req.session.is_logined  = true;
                req.session.name = data.name;
                req.session.id = data.id;
                req.session.pw = data.pw;
                req.session.save(function(){ // 세션 스토어에 적용하는 작업
                    res.render('main',{ // 정보전달
                        name : data[0].name,
                        id : data[0].id,
                        age : data[0].age,
                        is_logined : true
                    });
                });
            }
            else{
                req.session.is_logined  = false;
                console.log('비밀번호가 틀립니다.');
                req.session.save(function(){ // 세션 스토어에 적용하는 작업
                    res.render('login',{ // 정보전달
                        is_logined : false
                    });
                });
            }
        }
        else{
            req.session.is_logined  = false;
            console.log('로그인 실패');
            req.session.save(function(){ // 세션 스토어에 적용하는 작업
                res.render('login',{ // 정보전달
                    is_logined : false
                });
            });
        }
    });
});

router.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register');
});

router.post('/register',(req,res)=>{
    console.log('회원가입 하는중')
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    const age = body.age;

    connection.query('select * from userdata where id=?',[id],(err,data)=>{
        if(data.length == 0){
            console.log('회원가입 성공');
            connection.query('insert into userdata(id, name, age, pw) values(?,?,?,?)',[
                id, name, age, pw
            ]);
            res.redirect('/');
        }else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패");</script>')
            res.redirect('/login');
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
    console.log('화상상담');
    res.render('index');
});


module.exports=router