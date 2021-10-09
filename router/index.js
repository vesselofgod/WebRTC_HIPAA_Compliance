var express = require('express')
var app = express()
var router = express.Router()

var register = require('./register/register')
var login = require('./login/login')
var main = require('./main/main')
var logout = require('./logout/logout')

router.use('/', main)
router.use('/register', register)
router.use('/login', login)
router.use('/logout', logout)

module.exports=router