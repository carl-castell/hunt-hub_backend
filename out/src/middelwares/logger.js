"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logger = (request, response, next) => {
    console.log(new Date().toUTCString(), 'Request from', request.ip, request.method, request.originalUrl);
    next();
};
exports.logger = logger;
