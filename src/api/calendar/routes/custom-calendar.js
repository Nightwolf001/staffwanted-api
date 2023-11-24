module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/calendars/:id/employer/',
            handler: 'calendar.getEmployerCalendarEvents',
        },
        {
            method: 'GET',
            path: '/calendars/:id/employee/',
            handler: 'calendar.getEmployeeCalendarEvents',
        },
    ]
}