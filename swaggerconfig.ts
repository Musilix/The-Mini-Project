const SwaggerConfig: Object = {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'The Mini Project Swagger API',
      description: 'Making it EZ to test out some routes in this MVP',
      version: '0.1.0',
    },
    // externalDocs: {
    //   url: 'https://swagger.io',
    //   description: 'Find more info here',
    // },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'user', description: 'User related end-points' },
      { name: 'code', description: 'Code related end-points' },
    ],
    definitions: {
      User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
    },
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'apiKey',
        in: 'header',
      },
    },
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  // uiHooks: {
  //   onRequest: function (request, reply, next) {
  //     next();
  //   },
  //   preHandler: function (request, reply, next) {
  //     next();
  //   },
  // },
  staticCSP: true,
  // transformStaticCSP: (header) => header,
  exposeRoute: true,
};

export default SwaggerConfig;
