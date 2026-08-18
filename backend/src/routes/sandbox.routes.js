import express from 'express';

const router = express.Router();

const sampleJobs = [
  {
    slug: 'sandbox-frontend-dev-001',
    company_name: 'TechCorp GmbH',
    title: 'Frontend Developer',
    description: '<p>Build modern web applications with React and TypeScript.</p>',
    remote: true,
    url: 'https://example.com/jobs/frontend-dev',
    tags: ['React', 'TypeScript', 'Frontend'],
    job_types: ['Full-time'],
    location: 'Berlin',
    created_at: Math.floor(Date.now() / 1000),
  },
  {
    slug: 'sandbox-backend-eng-002',
    company_name: 'DataFlow AG',
    title: 'Backend Engineer',
    description: '<p>Design and implement scalable APIs and microservices.</p>',
    remote: false,
    url: 'https://example.com/jobs/backend-eng',
    tags: ['Node.js', 'Python', 'Backend'],
    job_types: ['Full-time'],
    location: 'Munich',
    created_at: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    slug: 'sandbox-devops-003',
    company_name: 'CloudScale Solutions',
    title: 'DevOps Engineer',
    description: '<p>Manage CI/CD pipelines and cloud infrastructure.</p>',
    remote: true,
    url: 'https://example.com/jobs/devops',
    tags: ['AWS', 'Docker', 'Kubernetes'],
    job_types: ['Full-time'],
    location: 'Remote',
    created_at: Math.floor(Date.now() / 1000) - 172800,
  },
  {
    slug: 'sandbox-data-sci-004',
    company_name: 'InsightAI',
    title: 'Data Scientist',
    description: '<p>Apply ML models to solve real-world business problems.</p>',
    remote: false,
    url: 'https://example.com/jobs/data-scientist',
    tags: ['Python', 'Machine Learning', 'Data'],
    job_types: ['Full-time'],
    location: 'Hamburg',
    created_at: Math.floor(Date.now() / 1000) - 259200,
  },
  {
    slug: 'sandbox-product-mgr-005',
    company_name: 'ProductHQ',
    title: 'Product Manager',
    description: '<p>Lead product strategy and roadmap for B2B SaaS platform.</p>',
    remote: true,
    url: 'https://example.com/jobs/product-manager',
    tags: ['Product', 'SaaS', 'Strategy'],
    job_types: ['Full-time'],
    location: 'Frankfurt',
    created_at: Math.floor(Date.now() / 1000) - 345600,
  },
];

router.get('/normal', (req, res) => {
  res.json({
    data: sampleJobs,
    links: { next: null },
    meta: { page: 1, terms: 'Sandbox data for testing purposes only' },
  });
});

router.get('/empty', (req, res) => {
  res.json({
    data: [],
    links: { next: null },
    meta: { page: 1, terms: 'Empty response simulation' },
  });
});

router.get('/rate-limit', (req, res) => {
  res.set('Retry-After', '30');
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please retry after 30 seconds.',
  });
});

router.get('/server-error', (req, res) => {
  res.status(503).json({
    error: 'Service Unavailable',
    message: 'The server is temporarily unavailable.',
  });
});

router.get('/malformed', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send('{ "data": [{ "title": "Broken", invalid json here');
});

router.get('/schema-change', (req, res) => {
  res.json({
    results: [
      {
        id: 'changed-001',
        position: 'Frontend Developer',
        employer: 'TechCorp GmbH',
        city: 'Berlin',
        link: 'https://example.com/jobs/frontend-dev',
        is_remote: true,
        posted_date: '2026-08-18',
      },
    ],
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'sandbox' });
});

export default router;
