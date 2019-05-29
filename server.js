const express = require('express')
const app = express()
const http = require('http')
const upload = require('express-fileupload')
const bodyParser = require('body-parser')
const handleUpload = require('./upload')
const handleEmail = require('./email')

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(upload())

app.get('/', (req, res) => res.render('index'))

app.post('/send-form', (req, res) => new Promise((resolve, reject) => {
    Promise
        .all([
            handleUpload(req.files),
            handleEmail(req.body),
        ])
        .then(() => res.render('success'))
        .catch(() => res.render('error'))
}))

app.listen(3010, port => console.log('Server Started at port ', port))