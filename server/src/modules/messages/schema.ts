const PostBody = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

export const postMessageSchema = {
  schema: {
    body: PostBody,
  },
};
