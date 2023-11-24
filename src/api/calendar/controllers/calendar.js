'use strict';

/**
 * calendar controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::calendar.calendar', ({ strapi }) => ({
    async getEmployerCalendarEvents(ctx) {
        try {
            const { id } = ctx.params;
            const entries = await strapi.entityService.findMany('api::calendar.calendar', {
                populate: ['*'],
                filters: {
                    employer: id,
                },
            });

            return this.transformResponse(entries);
        } catch (error) {
            console.log('error', error);
        }
    },
    async getEmployeeCalendarEvents(ctx) {
        try {
            const { id } = ctx.params;
            const entries = await strapi.entityService.findMany('api::calendar.calendar', {
                populate: ['*'],
                filters: {
                    employee: id,
                },
            });

            return this.transformResponse(entries);
        } catch (error) {
            console.log('error', error);
        }
    },
}));
