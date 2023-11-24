module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/jobs/filterd/:id',
            handler: 'job.findFilterdJobs',
        },
        {
            method: 'GET',
            path: '/jobs/employer/:id',
            handler: 'job.findEmployerJobs',
        },
        {
            method: 'GET',
            path: '/jobs/google/places/predictions',
            handler: 'job.googlePlacesPredictions',
        },
        {
            method: 'GET',
            path: '/jobs/google/places/details',
            handler: 'job.googlePlacesDetails',
        }
    ]
}