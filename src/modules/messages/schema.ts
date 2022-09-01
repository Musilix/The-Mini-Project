const PostMovieBody = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

export const postMessageSchema = {
  schema: {
    body: PostMovieBody,
  },
};
