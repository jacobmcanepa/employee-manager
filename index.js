const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

db.connect(err => {
  if (err) throw err;
  console.log('Database connected');
  initialPrompt();
});

const initialPrompt = () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'initialPrompt',
      message: 'What would you like to do?',
      choices: [
        'View all departments', 
        'View all roles', 
        'View all employees', 
        'Add a department', 
        'Add a role', 
        'Add an employee', 
        'Update an employee', 
        'EXIT'
      ]
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
    })
    .catch(err => {
      console.log(err);
    });
};

const viewDepartments = () => {
  const sql = `SELECT * FROM department`;

  db.query(sql, (err, data) => {
    if (err) throw err;
    console.table('\nDepartments', data);
    initialPrompt();
  });
};

const viewRoles = () => {
  const sql = `SELECT role.*, department.name AS departments
               FROM role
               LEFT JOIN department
               ON role.department_id = department.id`;

  db.query(sql, (err, data) => {
    let filteredData = [];
    if (err) throw err;

    data.forEach(role => {
      const obj = {
        id: role.id,
        title: role.title,
        salary: role.salary,
        departments: role.departments
      };
      filteredData.push(obj);
    });

    console.table('\nRoles', filteredData);
    initialPrompt();
  });
};

const viewEmployees = () => {
  const sql =  `SELECT employee.*, role.title, role.salary, department.name AS department
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id`;
  
  db.query(sql, (err, data) => {
    let filteredData = [];
    if (err) throw err;

    data.forEach(employee => {
      const obj = {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        title: employee.title,
        salary: employee.salary,
        department: employee.department
      };
      filteredData.push(obj);
    });

    console.table('\nEmployees', filteredData);
    initialPrompt();
  });
};

const addDepartment = () => {
  inquirer
    .prompt({
      type: 'text',
      name: 'departmentName',
      message: 'Enter new department name:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('Please enter a name!');
          return false;
        }
      }
    })
    .then(answer => {
      addDepartmentQuery(answer);
    })
    .catch(err => {
      console.log(err);
    });
};

const addDepartmentQuery = answer => {
  const sql = `INSERT INTO department (name) VALUES (?)`;
  const params = [answer.departmentName];

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log('\nA new department has been added!\n');
    initialPrompt();
  });
};

const addRole = () => {
  let arr = [];
  db.query(`SELECT name FROM department`, (err, result) => {
    if (err) throw err;
    result.forEach(item => {
      arr.push(item.name);
    });
  });

  inquirer
    .prompt([
      {
        type: 'text',
        name: 'roleTitle',
        message: 'Enter new role title:',
        validate: input => {
          if (input) {
            return true;
          } else {
            console.log('Please enter a title!');
            return false;
          }
        }
      },
      {
        type: 'number',
        name: 'roleSalary',
        message: "Enter the new role's salary:",
        validate: input => {
          if (input) {
            return true;
          } else {
            console.log('Please enter in a salary amount!');
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'departmentName',
        message: 'Pick a department:',
        choices: arr
      }
    ])
    .then(answers => {
      const index = (arr.indexOf(answers.departmentName) + 1);
      addRoleQuery(answers, index);
    })
    .catch(err => {
      console.log(err);
    });
};

const addRoleQuery = (answers, index) => {
  const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
  const params = [answers.roleTitle, answers.roleSalary, index];

  db.query(sql, params, (err, data) => {
    if (err) throw err;
    console.log('\nA new role as been added!\n');
    initialPrompt();
  });
};

const addEmployee = () => {
  // start empty array
  // write query that updates array with current role info
  // use array as choices argument for list question
  let arr = [];
  db.query(`SELECT title FROM role`, (err, result) => {
    if (err) throw err;
    result.forEach(item => {
      arr.push(item.title);
    });
  });

  inquirer
    .prompt([
      {
        type: 'text',
        name: 'firstName',
        message: 'Enter in a first name:',
        validate: input => {
          if (input) {
            return true;
          } else {
            console.log('Please enter in a first name!');
            return false;
          }
        }
      },
      {
        type: 'text',
        name: 'lastName',
        message: 'Enter in a last name:',
        validate: input => {
          if (input) {
            return true;
          } else {
            console.log('Please enter in a last name!');
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'roleTitle',
        message: 'Pick a role:',
        choices: arr
      }
    ])
    .then(answers => {
      const index = (arr.indexOf(answers.roleTitle) + 1);
      addEmployeeQuery(answers, index);
    })
    .catch(err => {
      console.log(err);
    });
};

const addEmployeeQuery = (answers, index) => {
  const sql = `INSERT INTO employee (first_name, last_name, role_id) VALUES (?,?,?)`;
  const params = [answers.firstName, answers.lastName, index];

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log('\nA new employee has been added!\n');
    initialPrompt();
  });
};

const updateEmployee = () => {
  console.log('Update employee function activated');
  initialPrompt();
};
