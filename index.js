const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

//create the connection to the db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testPass1?',
    database: 'buisness_db'
});

async function getAllDepartments() {

}

async function getAllRoles() {

}

async function getAllEmployees() {

}

async function addDepartment() {

}

async function addRole() {

}

async function addEmployee() {

}

async function updateEmployee() {
    
}