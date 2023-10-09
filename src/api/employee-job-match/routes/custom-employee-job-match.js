module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employee-job-match/upsert',
            handler: 'employee-job-match.upsert',
        },
        {
            method: 'GET',
            path: '/employee-job-matches/application-status/:id',
            handler: 'employee-job-match.getApplicationStatus',
        },
    ]
}