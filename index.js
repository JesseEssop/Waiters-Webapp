const express = require('express');
const flash = require('express-flash');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const routesFact = require('./waiter-routes');
const WaitersFactory = require('./function/waiterFactory');
const Helpers = require('./waiter-helpers');

const pg = require('pg');
const Pool = pg.Pool;

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
const connectionString = process.env.DATABASE_URL || 'postgresql://codex:codex123@localhost:5432/mywaiters';

const pool = new Pool({
    connectionString,
    // ssl: useSSL
});
const waiterRoute = routesFact(pool);
const waiterFact = WaitersFactory(pool);
const helpers = Helpers(waiterFact);
app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers }));
app.set('view engine', 'handlebars');



app.use(session({
    secret: "this is My String",
    resave: false,
    saveUninitialized: true
}));


app.use(flash());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', waiterRoute.indexRoute)
app.post('/', waiterRoute.loginRoute);
app.get('/waiters', waiterRoute.homeRoute);
app.post('/waiters', waiterRoute.workdaysRoute);

app.get('/waiters/:username', waiterRoute.waiterLog);

app.post('/logout', function (req, res){
    res.redirect('/');
});

app.post('/reset',waiterRoute.resetWaiter)

const PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
})