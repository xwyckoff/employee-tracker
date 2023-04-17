const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

//create the connection to the db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testPass1?',
    database: 'business_db'
});

//returns all of the departments from the department table
function getAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

//returns all of the roles from the role table
function getAllRoles() {
    db.query(`SELECT * FROM role`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

//returns all of the employees from the employee table
function getAllEmployees() {
    db.query(`SELECT * FROM employee`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function addDepartment() {
    inquirer.prompt([
        {
            name: 'depName',
            message: 'What is the name of the department?',
            type: 'input'
        }
    ])
    .then(answer => {
        db.query(`INSERT INTO department (name) VALUES (?)`, answer.depName, (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`Added department ${answer.depName} to the database`);
                mainMenu();
            }
        })
    })
}

function addRole() {

}

function addEmployee() {

}

function updateEmployee() {

}

function mainMenu() {
    inquirer.prompt([
        {
            name: 'option',
            message: 'What would you like to do?',
            type: 'list',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update Employee Role']
        }
    ])
    .then(answer => {
        switch(answer.option) {
            case "View All Departments":
                getAllDepartments();
                break;
            case "View All Roles":
                getAllRoles();
                break;
            case "View All Employees":
                getAllEmployees();
                break;
            case "Add a Department":
                addDepartment();
                break;
        }
    })
}

mainMenu();