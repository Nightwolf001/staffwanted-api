module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/jobs/filterd',
            handler: 'job.findFilterdJobs',
        },
    ]
}