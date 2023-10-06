'use strict';
var _ = require('lodash');
const axios = require('axios');
var moment = require('moment');


/**
 * job controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::job.job', ({strapi}) =>({

    // async find(ctx) {
    //     console.log('find', ctx)
    //     try {
      
    //         const entries = await strapi.entityService.findMany('api::job.job', {
    //             fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary'],
    //             sort: { createdAt: 'DESC' },
    //             populate: { 
    //                 employer: true,
    //                 job_roles: true,
    //                 preferred_hours: true,
    //                 experience: true,
    //             },
    //         });

    //         return this.transformResponse(entries);
            

            
    //     } catch (ex) {
    //         console.log('ex', ex)
    //     }
    // },

    async findFilterdJobs(ctx) {
        
        try {
            const { user_id } = ctx.request.header;
            const {query} = ctx;
            let {search, job_roles, experience, preferred_hours, distance, lat, lng} = query;

            console.log('query', query);
            console.log('user_id', user_id);
            console.log('search', search);
            console.log('lat', lat);
            console.log('lng', lng);
            console.log('job_roles', job_roles.split(','));
            console.log('experience', experience);
            console.log('preferred_hours', preferred_hours.split(','));

            let employee = await strapi.entityService.findOne('api::employee.employee', user_id, {
                fields: ['coord', 'location', 'place_id'],
                populate: { 
                    preferred_hours: true,
                    job_roles: true,
                    experience: true,
                    jobs: true,
                },
            });

            if(employee) {
                let entries
                if(search.length !== 0) {
                    entries = await strapi.entityService.findMany('api::job.job', {
                        fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary'],
                        filters: {
                            title: search.length !== 0 ? { $contains: search } : { $notNull: true},
                            experience: experience,
                        },
                        sort: { createdAt: 'DESC' },
                        populate: { 
                            employer: true,
                            job_roles: true,
                            preferred_hours: true,
                            experience: true,
                        },
                    });
                } else {
                    entries = await strapi.entityService.findMany('api::job.job', {
                        fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary'],
                        filters: {
                            experience: experience,
                            job_roles: job_roles.split(',') ,
                            preferred_hours: preferred_hours.split(','),
                        },
                        sort: { createdAt: 'DESC' },
                        populate: { 
                            employer: true,
                            job_roles: true,
                            preferred_hours: true,
                            experience: true,
                        },
                    });
                }


                const filteredEntries = [];
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const jobCoord = entry.coord;
                    const userCoord = employee.coord;
                    const distance_from_location = await this.getDistanceFromLatLonInKm(jobCoord.lat, jobCoord.lng, lat, lng);
                    if(distance_from_location < distance) {
                        filteredEntries.push(entry);
                    }
                }
                
               for (let j = 0; j < filteredEntries.length; j++) {
                    const entry = filteredEntries[j];
                    for (let e = 0; e < employee.jobs.length; e++) {
                        const job = employee.jobs[e];
                        if (entry.id === job.id) {
                            entry.bookmarked = true;
                        } else {
                            entry.bookmarked = false;
                        }
                    }
                }

                return this.transformResponse(filteredEntries);
            }

            
        } catch (ex) {
            console.log('ex', ex)
        }
    },

    async findOne(ctx) {
        try {

            const { id } = ctx.params;
            const entry = await strapi.entityService.findOne('api::job.job', id, {
                fields: ['*'],
                populate: { 
                    employer: true,
                    job_roles: true,
                    preferred_hours: true,
                    experience: true,
                },
            });

            return this.transformResponse(entry);
            
        } catch (ex) {
            console.log('ex', ex)
        }
    },

    async getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = await this.deg2rad(lat2 - lat1); // deg2rad below
        const dLon = await this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(await this.deg2rad(lat1)) * Math.cos(await this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    },

    async deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

}));
