module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employer/register',
            handler: 'employer.createAccount',
        },
        {
            method: 'GET',
            path: '/employer/filter/employees',
            handler: 'employer.filterEmployees',
        },
    ]
}