"use strict";

var rest = require('restler');

var url;

class Employees {

  constructor(_url) {
    console.log("Downloading from: " + _url);
    url = _url;
  }

  findAll(req, res, next) {
    var name = req.query.name;
    if (name) {
        rest.get(url + '/getEmployeeByName?name=' + name).on('complete', function(data) {
          res.send(data.employees);
          next();
        })
    } else {
        rest.get(url + '/getAllEmployees').on('complete', function(data) {
          res.send(data.employees);
          next();
        });
    }
  }

  findById(req, res, next) {
    var id = req.params.id;
    rest.get(url + '/getEmployeeById?id=' + id).on('complete', function(employee) {
      res.send(employee);
    });
  }

}

module.exports = Employees;
