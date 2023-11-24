'use strict';
var _ = require('lodash');

/**
 * employee-job-match controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employee-job-match.employee-job-match', ({strapi}) =>({

    async find(ctx) {
        try {
    
            const { id } = ctx.params;
            const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
            populate: {
                job : {
                    populate: {
                        employer: true,
                        job_roles: true,
                        preferred_hours: true,
                        experience: true,
                    }
                }
            },
            filters: {
                employee: id,
            }
        });

        return this.transformResponse(entries);

        } catch (error) {
            console.log('error', error)
        }
    },

    async upsert(ctx) {

        const { body } = ctx.request
        const { job_id, bookmarked, applied, application_status, status_description, user_id } = body
        

        const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
            populate: ['job', 'employee'],
            filters: {
                employee: user_id,
                job: job_id ,
            }
        });

        
        if(entries.length !== 0) {
            
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];

                let query = {};
                if(bookmarked !== undefined) {
                    query.bookmarked = bookmarked;
                    query.applied = applied !== undefined ? applied : entry.applied;
                    query.application_status = application_status ? application_status : entry.application_status;
                    query.status_description = status_description ? status_description : entry.status_description;
                }

                if(applied !== undefined) {
                    query.bookmarked = bookmarked !== undefined ? bookmarked : entry.bookmarked;
                    query.applied = applied;
                    query.application_status = applied ? 'pending' : 'none';
                    query.status_description = status_description ? status_description : entry.status_description;
                }

                let item = await strapi.entityService.update('api::employee-job-match.employee-job-match', entry.id, {
                    data: {
                        bookmarked: bookmarked !== undefined ? bookmarked : entry.bookmarked,
                        applied: applied !== undefined ? applied : entry.applied,
                        application_status: application_status ? application_status : entry.application_status,
                        status_description: status_description ? status_description : entry.status_description,
                    }
                })
            }
            return this.transformResponse({updated: true});

        } else {
            console.log('entry does not exist')
            const entry = await strapi.entityService.create('api::employee-job-match.employee-job-match', {
                data: {
                    bookmarked: bookmarked,
                    applied: applied,
                    application_status: application_status,
                    status_description: status_description,
                    employee: user_id,
                    job: job_id,
                }
            });
            return this.transformResponse({updated: true});
        }
    },

    async getApplicationStatus(ctx) {
        try {

        const { id, user_id } = ctx.params;
        const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
            populate: ['job'],
            filters: {
                employee: user_id,
                job: id,
            }
        });

        if(entries.length !== 0) {
            return this.transformResponse(entries[0]);
        } else {
            return this.transformResponse({});
        }

        } catch (error) {
            console.log('error', error)
        }
    },

    async getApplicantsByJob(ctx) {
        try {

        const { body } = ctx.request
        const { ids } = body
        const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
            populate: ['employee'],
            filters: { job: ids }
        });

        const employee_ids = _.map(entries, item => (item.employee.id));
        
        let applicants = await strapi.entityService.findMany('api::employee.employee', {
            fields: ['*'],
            filters: {
                id : employee_ids,
            },
            populate: { 
                gender: true,
                preferred_hours: true,
                job_roles: true,
                experience: true,
                employee_job_matches: {
                    populate: {
                        job: {
                            populate: {
                                employer: true,
                            }
                        },
                    }
                },
             },
        });
        
        return this.transformResponse(applicants);

        } catch (error) {
            console.log('error', error)
        }
    },

    async getApplicationsByJob(ctx) {
        try {

            const { body } = ctx.request
            const { ids } = body

            const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
                populate: ['employee', 'job'],
                filters: { job: ids, applied: true },
                sort: { createdAt: 'DESC' },
            });

            return this.transformResponse(entries);


        } catch (error) {
            console.log('error', error)
        }
    },

    async getApplicationAnalytics(ctx) {
        try {

        const { body } = ctx.request
        const { ids } = body
        const entries = await strapi.entityService.findMany('api::employee-job-match.employee-job-match', {
            populate: ['employee', 'job'],
            filters: { job: ids, applied: true },
            sort: { createdAt: 'DESC' },
        });
        
        let analytics = {
            total_applications: entries.length,
            total_pending: _.filter(entries, { 'application_status': 'pending' }).length,
            total_reviewing: _.filter(entries, { 'application_status': 'reviewing' }).length,
            total_accepted: _.filter(entries, { 'application_status': 'approved' }).length,
            total_rejected: _.filter(entries, { 'application_status': 'declined' }).length,
            latest_applications: entries.splice(0, 10),
        };
    
        
        return this.transformResponse(analytics);
        

        } catch (error) {
            console.log('error', error)
        }
    },

}));







    