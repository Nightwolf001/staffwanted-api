module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employees/signup',
            handler: 'employee.createAccount',
        },
        { // Path defined with an URL parameter
            method: 'GET',
            path: '/employees/google/places/predictions',
            handler: 'employee.googlePlacesPredictions',
        },
        { // Path defined with an URL parameter
            method: 'GET',
            path: '/employees/google/places/details',
            handler: 'employee.googlePlacesDetails',
        },
        { // Path defined with an URL parameter
            method: 'GET',
            path: '/employees/:id/employer',
            handler: 'employee.getEmplyeesByEmployer',
        },
        
    ]
}