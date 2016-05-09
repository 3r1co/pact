var express = require('express'),
    Employees = require('./routes/employees'),
    app = express();

app.use(express.static('www'));

// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.all('/employees*', function(req, res, next) {
    res.header("Content-Type", "application/json");
    next();
});

app.set('employee_service', process.env.EMPLOYEE_SERVICE || 'http://employees');

var employees = new Employees(app.get('employee_service'));

app.get('/employees', employees.findAll);
app.get('/employees/:id', employees.findById);

app.set('port', process.env.PORT || 5000);

module.exports = app;

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
