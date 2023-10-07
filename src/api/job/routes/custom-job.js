module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/jobs/filterd',
            handler: 'job.findFilterdJobs',
        },
        {
            method: 'GET',
            path: '/jobs/bookmarked',
            handler: 'job.findBookmarkedJobs',
        },
    ]
}