module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/employee-job-map/update-or-create',
            handler: 'employee-job-map.updateOrCreate',
        },
    ]
}