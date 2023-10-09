'use strict';

/**
 * employee-job-match controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employee-job-match.employee-job-match', ({strapi}) =>({

    async find(ctx) {
        try {
            console.log('find', ctx)
            const { user_id } = ctx.request.header;
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
                employee: user_id,
            }
        });

        return this.transformResponse(entries);

        } catch (error) {
            console.log('error', error)
        }
    },

    async upsert(ctx) {

        const { user_id } = ctx.request.header;
        const { body } = ctx.request
        const { job_id, bookmarked, applied, application_status, status_description } = body
        

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
                        query.application_status = applied ? 'applied' : 'none';
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
                console.log('item', item)
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
            console.log('entry', entry)
            return this.transformResponse({updated: true});
        }
    },

    async getApplicationStatus(ctx) {
        try {

        const { user_id } = ctx.request.header;
        const { id } = ctx.params;

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
    }

}));







    