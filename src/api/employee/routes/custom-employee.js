module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employees/signup',
            handler: 'employee.createAccount',
        },
    ]
}