package com.example.pact.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.pact.model.Employee;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;

@RestController
public class EmployeeController {

    private List<Employee> employees = Collections.emptyList();

    @PostConstruct
    public void init() {
        try {
            InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("employees.json");
            employees = new ObjectMapper().readValue(is, new TypeReference<List<Employee>>(){});
        }catch(IOException e) {
            System.err.println(e.getMessage());
        }
    }

    @RequestMapping("/getAllEmployees")
    public Map<String, List<Employee>> getAllEmployees() { return prepareResponse(employees); };

    @RequestMapping("/getEmployeeByName")
    public Map<String, List<Employee>> getEmployeeByName(@RequestParam(value="name", required = true) String name) {
        Stream<Employee> employeeStream = employees.stream().filter(e -> e.getLastName().contains(name));
        return prepareResponse(employeeStream.collect(Collectors.toList()));
    }

    @RequestMapping("/getEmployeeById")
    public Employee getEmployeeById(@RequestParam(value="id", required = true) int id) {
        try{ return employees.stream().filter(e -> e.getId() == id).findFirst().get();
        } catch(NoSuchElementException e) { return null; }
    }

    private Map<String, List<Employee>> prepareResponse(List<Employee> list) {
        Map<String, List<Employee>> result = new HashMap<>();
        result.put("employees", list);
        return result;
    }

}