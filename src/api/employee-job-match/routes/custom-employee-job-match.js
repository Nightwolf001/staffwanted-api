module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employee-job-match/upsert',
            handler: 'employee-job-match.upsert',
        },
        {
            method: 'GET',
            path: '/employee-job-matches/:id',
            handler: 'employee-job-match.find',
        },
        {
            method: 'GET',
            path: '/employee-job-matches/application-status/:id/:user_id',
            handler: 'employee-job-match.getApplicationStatus',
        },
        {
            method: 'POST',
            path: '/employee-job-matches/job/applicants',
            handler: 'employee-job-match.getApplicantsByJob',
        },
        {
            method: 'POST',
            path: '/employee-job-matches/job/applications',
            handler: 'employee-job-match.getApplicationsByJob',
        },
        {
            method: 'POST',
            path: '/employee-job-matches/applications/analytics',
            handler: 'employee-job-match.getApplicationAnalytics',
        },
    ]
}