'use strict';
var _ = require('lodash');
const axios = require('axios');
var moment = require('moment');
const geolib = require('geolib');


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
        console.log('findFilterdJobs', ctx)
        try {
    
            const { id } = ctx.params;
            const {query} = ctx;
            let {search, job_roles, experience, preferred_hours, distance, lat, lng, metric} = query;

            console.log('query', query);
            console.log('user_id', id);
            console.log('search', search);
            console.log('lat', lat);
            console.log('lng', lng);
            console.log('metric', metric);
            console.log('job_roles', job_roles.split(','));
            console.log('experience', experience);
            console.log('preferred_hours', preferred_hours.split(','));

            let employee = await strapi.entityService.findOne('api::employee.employee', id, {
                fields: ['coord', 'location', 'place_id'],
                populate: { 
                    preferred_hours: true,
                    job_roles: true,
                    experience: true,
                    employee_job_matches: {
                        populate: ['job']
                    },
                },
            });

           
        
            if(employee) {
                let entries
                if(search && search.length !== 0) {

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

                    console.log('entries', entries);
                }

                // filter through the entries and add the bookmarked property
                // referencing the employee_job_match table
                for (let j = 0; j < entries.length; j++) {
                    const entry = entries[j];
                    if(employee.employee_job_matches.length !== 0) {
                        for (let e = 0; e < employee.employee_job_matches.length; e++) {
                            const job_map = employee.employee_job_matches[e];
                            if (entry.id === job_map.job.id) {
                                entry.bookmarked = job_map.bookmarked;
                            } 
                        }
                    } else {
                        entry.bookmarked = false;
                    }
                }

                const filteredEntries = [];
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const jobCoord = entry.coord;
                    const distance_from_location = await this.calculatePreciseDistance(jobCoord.lat, jobCoord.lng, lat, lng, metric);
                    console.log('distance_from_location', distance_from_location);
                    if(distance_from_location < distance) {
                        filteredEntries.push(entry);
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
    },

    async calculatePreciseDistance (lat1, lon1, lat2, lon2, metric) {

        var pdis = geolib.getPreciseDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 },
        );

        let distance = geolib.convertDistance(pdis, metric);
        return distance;
    }

}));
