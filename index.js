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

//returns all of the employees from the employee table with their respective title, salary, department, and manager
function getAllEmployees() {
    db.query(`
    SELECT e1.id, e1.first_name, e1.last_name, role.title, role.salary, department.name AS department, CONCAT(e2.first_name, ' ', e2.last_name) AS manager 
    FROM employee e1 
    JOIN role ON e1.role_id = role.id 
    JOIN department 
    ON role.department_id = department.id 
    LEFT JOIN employee e2 
    ON e1.manager_id = e2.id`, (err, results) => {
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
            choices: deps.map(obj => obj.name)
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

async function addEmployee() {
    //get all of the roles from the role table
    const roles = await query(`SELECT * FROM role`);
    const employees = await query(`SELECT * FROM employee`);
    //added another object to the list of employees that gives an option for not having a manager
    employees.push({
        first_name: "No",
        last_name: "Manager",
        id: null
    })

    inquirer.prompt([
        {
            name: 'firstName',
            message: "What is the employee's first name?",
            type: 'input'
        },

        {
            name: 'lastName',
            message: "What is the employee's last name?",
            type: 'input'
        },

        {
            name: 'role',
            message: 'What role is the employee in?',
            type: 'list',
            choices: roles.map(obj => obj.title)
        },

        {
            name: 'manager',
            message: "Who is the employee's manager?",
            type: 'list',
            choices: employees.map(obj => `${obj.first_name} ${obj.last_name}`)
        }
    ])

    .then(answer => {
        //get the role object of the role the user selected for the employee
        let roleId = roles.filter(obj => {
            return obj.title == answer.role;
        })

        //get the manager object of the manager the user selected for the employee
        let managerId = employees.filter(obj => {
            if(answer.manager) return `${obj.first_name} ${obj.last_name}` == answer.manager;
            else {
                
            }
        })

        //add the employee to the database
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answer.firstName, answer.lastName, roleId[0].id, managerId[0].id], (err, results) => {
            if(err) console.log(err)
            else {
                console.log(`Added employee ${answer.firstName} ${answer.lastName} to database.`);
                mainMenu();
            }
        })
    })
}

async function updateEmployeeRole() {
    //get roles and employees from the database
    const roles = await query(`SELECT * FROM role`);
    const employees = await query(`SELECT * FROM employee`);
    inquirer.prompt([
        {
            name: 'employee',
            message: 'Which employee would you like to change the role of?',
            type: 'list',
            //set the choices equal to employee names
            choices: employees.map(obj => `${obj.first_name} ${obj.last_name}`)
        },

        {
            name: 'role',
            message: "What would you like to change the employee's role to?",
            type: 'list',
            //set the choices equal to the role titles
            choices: roles.map(obj => obj.title)
        }
    ])

    .then(answer => {
        //retrieve the JSONs of the selected employee and role from the database
        let roleId = roles.filter(obj => obj.title == answer.role);
        let empId = employees.filter(obj => `${obj.first_name} ${obj.last_name}` == answer.employee);
        //update the chosen employee to the chosen role
        db.query(`
        UPDATE employee
        SET role_id = ?
        WHERE id = ?`, [roleId[0].id, empId[0].id], (err, results) => {
            if(err) console.log(err)
            else {
                console.log(`Updated role of ${answer.employee} to ${answer.role}`);
                mainMenu();
            }
        });
    })
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
            case "Add an Employee":
                addEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
        }
    })
}

mainMenu();