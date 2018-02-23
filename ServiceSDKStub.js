'use strict';
import ServiceAuthentication from './authentication/ServiceAuthentication';
import RequestExecutor from './clients/RequestExecutor';
import ServiceClient from './clients/ServiceClient';
import { TokenTypes } from './clients/TokenType';

/****************************************
 * Setup for singleton
 ****************************************/
let instance = null;

const requestExecutor = new RequestExecutor();
const serviceClient = new ServiceClient();

/**
 * Set up private data storage
 * @type {WeakMap}
 * @private
 */
let _protocol = new WeakMap();
let _port = new WeakMap();
let _host = new WeakMap();
let _pathname = new WeakMap();
let _baseUrl = new WeakMap();

const RecommendationTypes = Object.freeze({
    SCORE: 'score',
    LIQUIDITY: 'liquidity',
    SAVINGS: 'savings',
    DEBT_RATIO: 'debtRatio',
    LIFE_INSURANCE: 'lifeInsurance',
});

/**
 * @class ServiceSDK
 */
export default class ServiceSDK {

    /**
     *
     * @param {String} protocol
     * @param {String} host
     * @param {String} port
     * @param {String} pathname
     * @param {Function} logger
     * @returns {ServiceSDK}
     */
    constructor({ protocol = 'https', host = '', port = '', pathname = '/recommendations', logger = null } = {}) {

        if (!host) {
            throw new Error('ServiceSDK ERROR: Required host not specified.');
        }

        if (!instance) {

            _protocol.set(this, protocol);
            _port.set(this, port);
            _host.set(this, host);
            _pathname.set(this, pathname);
            _baseUrl.set(this, `${protocol}://${host}${port ? ':' + port : ''}${pathname}`);

            requestExecutor.debug(logger || (()=>{}));
            serviceClient.debug(logger || (()=>{}));

            instance = this;
        }

        return instance;
    }

    static getRecommendationTypes() {
        return RecommendationTypes;
    }

    static getToken(hostUrl, serviceAuthentication, { username = '', password = ''}) {
        return new Promise((resolve, reject) => {
            requestExecutor.executeRequest(
                serviceClient.getToken(hostUrl, serviceAuthentication, { username, password }),
                resolve,
                reject
            );
        });
    }

    static getAuthentication({ tokenType = 'ANONYMOUS', token = '', userId = '' }) {
        return new Promise((resolve, reject) => {
            requestExecutor.executeRequest(
                new Promise((resolve2, reject2) => {
                    if (!tokenType) {
                        reject2(new Error('Invalid tokenType: ' + tokenType));
                    } else if (!token) {
                        reject2(new Error('Invalid token: ' + token));
                    } else {
                        resolve2(new ServiceAuthentication({ tokenType, token, userId }));
                    }
                }),
                resolve,
                reject
            );
        });
    }

    getRecommendationSummary(serviceAuthentication, userId, recommendationModule) {
        const hostUrl = _baseUrl.get(this);
        return new Promise((resolve, reject) => {
            requestExecutor.executeRequest(
                serviceClient.getRecommendation(hostUrl, serviceAuthentication, userId, recommendationModule, 'short'),
                resolve,
                reject
            );
        });
    }

    getRecommendationDetail(serviceAuthentication, userId, recommendationModule) {
        const hostUrl = _baseUrl.get(this);
        return new Promise((resolve, reject) => {
            requestExecutor.executeRequest(
                serviceClient.getRecommendation(hostUrl, serviceAuthentication, userId, recommendationModule, 'long'),
                resolve,
                reject
            );
        });
    }
}