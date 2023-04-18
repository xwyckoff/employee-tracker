const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const util = require('util');

//create the connection to the db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testPass1?',
    database: 'business_db'
});

//use util.promisify to make the query method asynchronous
const query = util.promisify(db.query).bind(db);

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

//adds a new department that the user specifies the name of
function addDepartment() {
    //adds a department of the name given by the user
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

async function addRole() {

    //retrieves all of the departments and puts them in the deps variable
    const deps = await query(`SELECT * FROM department`)
    //takes just the list of department names and puts them into the depsArr variable
    let depsArr = deps.map(obj => obj.name);
    inquirer.prompt([
        {
            name: 'title',
            message: 'What is the title of the role?',
            type: 'input'
        },

        {
            name: 'salary',
            message: 'What is the salary of the role?',
            type: 'input'
        },

        {
            name: 'dep',
            message: 'What department is this role in?',
            type: 'list',
            //set the choices equal to only the department names
            choices: depsArr
        }
    ])

    .then(answer => {
        //set the depID variable equal to the row of the department that the user chose that way we can get the department ID from the department the user chose
        let depID = deps.filter(obj => {
            return obj.name == answer.dep;
        })
        
        //insert the new role into the table, using the answer as well as the ID of the department the user chose
        db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answer.title, answer.salary, depID[0].id], (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`Added role ${answer.title} to database`);
                mainMenu();
            }
        })
    })



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
            case "Add a Role":
                addRole();
                break;
        }
    })
}

mainMenu();