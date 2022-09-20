const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const getDepartments = require('./lib/getDepartments');
const getRoles = require('./lib/getRoles');
const getEmployees = require('./lib/getEmployees');

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
  let departmentArr = [];
  getDepartments()
    .then(data => {
      data.forEach(object => {
        departmentArr.push(object.name);
      });
      rolePrompts(departmentArr)
        .then(answers => {
          const index = departmentArr.indexOf(answers.departmentName);
          const id = data[index].id;
          addRoleQuery(answers, id);
        })
    })
    .catch(err => {
      console.log(err);
    });
};

const rolePrompts = (arr) => {
  return inquirer
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
    ]);
};

const addRoleQuery = (answers, id) => {
  const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
  const params = [answers.roleTitle, answers.roleSalary, id];

  db.query(sql, params, (err, data) => {
    if (err) throw err;
    console.log('\nA new role as been added!\n');
    initialPrompt();
  });
};

const addEmployee = () => {
   let roleArr = [];
   getRoles()
    .then(data => {
      data.forEach(object => {
        roleArr.push(object.title);
      });
      employeePrompts(roleArr)
        .then(answers => {
          const index = roleArr.indexOf(answers.roleTitle);
          const id = data[index].id;
          addEmployeeQuery(answers, id);        
        });
    });
};

const employeePrompts = (arr) => {
  return inquirer
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
    ]);
};

const addEmployeeQuery = (answers, id) => {
  const sql = `INSERT INTO employee (first_name, last_name, role_id) VALUES (?,?,?)`;
  const params = [answers.firstName, answers.lastName, id];

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log('\nA new employee has been added!\n');
    initialPrompt();
  });
};

const updateEmployee = () => {
  let employeeArr = [];
  let roleArr = [];

  getEmployees()
    .then(eData => {
      eData.forEach(object => {
        const fullName = object.first_name + ' ' + object.last_name;
        employeeArr.push(fullName);
      });
      getRoles()
        .then(rData => {
          rData.forEach(object => {
            roleArr.push(object.title);
          });
          updatePrompts(employeeArr, roleArr)
            .then(answers => {
              const eIndex = employeeArr.indexOf(answers.chooseEmployee);
              const rIndex = roleArr.indexOf(answers.chooseRole);
              const employeeId = eData[eIndex].id;
              const roleId = rData[rIndex].id;
              updateEmployeeQuery(roleId, employeeId);
            });
        });
    });
};

const updatePrompts = (employeeArr, roleArr) => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'chooseEmployee',
        message: 'Pick an employee:',
        choices: employeeArr
      },
      {
        type: 'list',
        name: 'chooseRole',
        message: "Pick employee's new role:",
        choices: roleArr
      }
    ]);
};

const updateEmployeeQuery = (roleId, employeeId) => {
  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
  const params = [roleId, employeeId];

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log('\nEmployee role has been updated!\n');
    initialPrompt();
  });
};