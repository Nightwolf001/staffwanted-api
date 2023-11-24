'use strict';
var _ = require('lodash');
const axios = require('axios');
var moment = require('moment');
const geolib = require('geolib');

/**
 * employer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employer.employer', ({strapi}) =>({

    async createAccount(ctx) {

        const { body } = ctx.request
        const { company_name, company_email, password } = body

        let find = await strapi.entityService.findMany('api::employer.employer', {
            filters: {
                company_email: company_email
            }
        });

        if (find.length === 0) { 
            console.log('user does not exist')
            const entry = await strapi.entityService.create('api::employer.employer', {
                data: {
                    company_email: company_email,
                    company_name: company_name,
                    account_complete: false,
                },
            });
    
        try {
            const user = await strapi.plugins['users-permissions'].services.user.add({
                username: company_email,
                email: company_email,
                provider: 'local',
                password: password,
                confirmed: true,
                blocked: false,
                role: 3,
                user_type: 'employer',
                profile_id: entry.id,
                password_set: true,
                created_by: 3,
                updated_by: 3
            })

        console.log('user', user)
        } catch (error) {
            console.log('error', error)
            if(error.message.includes("attribute must be unique")) {
            return false
            }
        }
            const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
            console.log('sanitizedEntity', sanitizedEntity)
            return this.transformResponse(sanitizedEntity);

        } else {
            return 9001
        }
    },

    async filterEmployees(ctx) {
        console.log('filterEmployees')
        try {

            const {query} = ctx;
            console.log('query', query)
            let {search, job_roles, experience, preferred_hours, distance, lat, lng, metric} = query;

            console.log(JSON.stringify(query));

            let filters = {
                account_complete: true,
                hide_profile: false,
            }

            if(job_roles && job_roles.length !== 0) {
                filters.job_roles = job_roles.split(',');
            } 

            if(experience && experience.length !== 0) {
                filters.experience = experience.split(',');
            } 

            if(preferred_hours && preferred_hours.length !== 0) {
                filters.preferred_hours = preferred_hours.split(',');
            } 
            
            if(search && search.length !== 0) {
                filters.title = search.length !== 0 ? { $contains: search } : { $notNull: true}
            } 

            console.log('filters', filters)

            const entries = await strapi.entityService.findMany('api::employee.employee',{
                fields: ['*'],
                filters: filters,
                sort: { createdAt: 'DESC' },
                populate: { 
                    preferred_hours: true,
                    job_roles: true,
                    experience: true,
                    employee_job_matches: {
                        populate: {
                            job : {
                                populate: {
                                    employer: true,
                                    job_roles: true,
                                    preferred_hours: true,
                                    experience: true,
                                }
                            }
                        }
                    },
                },
            });

            console.log('entries', entries)
            const filteredEntries = [];
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const employee = entry.coord;
                const distance_from_job = await this.calculatePreciseDistance(employee.lat, employee.lng, lat, lng, metric);
                entry.distance_from_job = distance_from_job;
                if(distance_from_job < distance) { filteredEntries.push(entry)}
            }

            const sanitizedEntity = await this.sanitizeOutput(filteredEntries, ctx);
            return this.transformResponse(sanitizedEntity);
            
        } catch (error) {
            
        }
    },

    async calculatePreciseDistance (lat1, lon1, lat2, lon2, metric) {

        var pdis = geolib.getPreciseDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 },
        );

        let distance = geolib.convertDistance(pdis, metric);
        return distance;
    },
}));





