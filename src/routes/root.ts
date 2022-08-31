import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  fastify.get('/', async function () {
    return { root: true };
  });
});
