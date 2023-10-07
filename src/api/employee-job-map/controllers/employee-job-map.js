'use strict';

/**
 * employee-job-map controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employee-job-map.employee-job-map', ({strapi}) =>({

    async updateOrCreate(ctx) {

        const { user_id } = ctx.request.header;
        const { body } = ctx.request
        const { job_id, bookmarked, applied, application_status, status_description } = body
        

        const entries = await strapi.entityService.findMany('api::employee-job-map.employee-job-map', {
            populate: ['jobs', 'employees'],
            filters: {
                employees: [ user_id ],
                jobs: [ job_id ],
            }
        });
        console.log('entries', entries)
        if(entries.length !== 0) {
            console.log('entry exists', JSON.stringify(entries))

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];

                let bookmark_item = await strapi.entityService.update('api::employee-job-map.employee-job-map', entry.id, {
                    data: {
                        bookmarked: bookmarked !== undefined ? bookmarked : entry.bookmarked,
                        applied: applied !== undefined ? applied : entry.applied,
                        application_status: application_status ? application_status : entry.application_status,
                        status_description: status_description ? status_description : entry.status_description,
                    }
                })
                console.log('bookmark_item', bookmark_item)
            }
            return this.transformResponse({updated: true});

        } else {
            console.log('entry does not exist')
            const entry = await strapi.entityService.create('api::employee-job-map.employee-job-map', {
                data: {
                    bookmarked: bookmarked,
                    applied: applied,
                    application_status: application_status,
                    status_description: status_description,
                    employees: [ user_id ],
                    jobs: [ job_id ],
                }
            });
            console.log('entry', entry)
            return this.transformResponse({updated: true});
        }

        

    },

}));
