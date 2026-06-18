import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PIC Portal API',
      version: '1.0.0',
      description: 'REST API for the U-Turn4Nature PIC Partner Portal',
    },
    servers: [
      { url: '/api', description: 'Current server' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

let swaggerSpec: object;
try {
  swaggerSpec = swaggerJsDoc(options);
} catch {
  swaggerSpec = {};
}

export function setupSwagger(app: Express): void {
  // Expose docs in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'PIC Portal API Docs',
    }));

    // Raw JSON spec endpoint
    app.get('/api/docs.json', (_req: Request, res: Response) => {
      res.json(swaggerSpec);
    });

    console.log('📚 Swagger UI available at: /api/docs');
  }
}
