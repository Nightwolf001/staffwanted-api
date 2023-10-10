module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/jobs/filterd/:id',
            handler: 'job.findFilterdJobs',
        }
    ]
}