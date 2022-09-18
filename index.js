const inquirer = require('inquirer');
const db = require('./db/connection');

db.connect(err => {
  if (err) throw err;
  console.log('Database connected');
  initialPrompt();
});

const initialPrompt = () => {
  return inquirer
    .prompt({
      type: 'list',
      name: 'initialPrompt',
      message: 'What would you like to do?',
      choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee', 'EXIT'],
      validate: input => {
        if (input.length > 0) {
          return true;
        } else {
          console.log('Please pick an option!');
          return false;
        }
      }
    })
    .then(answer => {
      switch (answer.initialPrompt) {
        case ('View all departments'):
          viewDepartments();
          break;
        case ('View all roles'):
          viewRoles();
          break;
        case ('View all employees'):
          viewEmployees();
          break;
        case ('Add a department'):
          addDepartment();
          break;
        case ('Add a role'):
          addRole();
          break;
        case ('Add an employee'):
          addEmployee();
          break;
        case ('Update an employee'):
          updateEmployee();
          break;
        case ('EXIT'):
          db.end();
      }
    });
};

const viewDepartments = () => {
  console.log('View departments function activated');
  initialPrompt();
};

const viewRoles = () => {
  console.log('View roles function activated');
  initialPrompt();
};

const viewEmployees = () => {
  console.log('View employees function acitvated');
  initialPrompt();
};

const addDepartment = () => {
  console.log('Add departments function activated');
  initialPrompt();
};

const addRole = () => {
  console.log('Add role function activated');
  initialPrompt();
};

const addEmployee = () => {
  console.log('Add employee function activated');
  initialPrompt();
};

const updateEmployee = () => {
  console.log('Update employee function activated');
  initialPrompt();
};
