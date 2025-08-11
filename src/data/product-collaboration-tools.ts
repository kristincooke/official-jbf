export const productCollaborationCategory = {
  name: 'Product Team Collaboration AI',
  description: 'AI-powered tools for fast-paced, high-fidelity collaboration and prototyping between Product/Project managers, UX designers, and Engineers. Features integration with planning tools like JIRA, Confluence, and requirements management.',
  color_theme: '#FF6B6B',
  icon: 'Users'
}

export const productCollaborationTools = [
  {
    name: 'Figma AI',
    description: 'AI-powered design collaboration platform with real-time prototyping, design systems, and developer handoff. Integrates with JIRA, Slack, and project management tools for seamless workflow.',
    website_url: 'https://figma.com',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://cdn.worldvectorlogo.com/logos/figma-1.svg',
    tags: ['design', 'prototyping', 'collaboration', 'ai', 'handoff', 'jira-integration'],
    features: [
      'AI-powered design suggestions',
      'Real-time collaborative editing',
      'Developer handoff with code generation',
      'JIRA and Asana integrations',
      'Design system management',
      'Interactive prototyping',
      'Version control and branching'
    ],
    integrations: ['JIRA', 'Slack', 'Asana', 'Notion', 'GitHub', 'VS Code'],
    target_users: ['Product Managers', 'UX Designers', 'Engineers', 'Project Managers']
  },
  {
    name: 'Miro AI',
    description: 'AI-enhanced collaborative whiteboarding platform for product teams. Features intelligent diagramming, automated user story mapping, and seamless integration with development tools.',
    website_url: 'https://miro.com',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://cdn.worldvectorlogo.com/logos/miro-2.svg',
    tags: ['whiteboarding', 'collaboration', 'ai', 'user-stories', 'planning', 'integration'],
    features: [
      'AI-powered mind mapping',
      'Automated user story generation',
      'Smart template suggestions',
      'Real-time collaboration',
      'Integration with JIRA and Confluence',
      'Agile planning boards',
      'Workshop facilitation tools'
    ],
    integrations: ['JIRA', 'Confluence', 'Slack', 'Microsoft Teams', 'Asana', 'Trello'],
    target_users: ['Product Managers', 'Scrum Masters', 'UX Designers', 'Engineers']
  },
  {
    name: 'Notion AI',
    description: 'All-in-one workspace with AI writing assistance for product requirements, specifications, and team collaboration. Connects product planning with development workflows.',
    website_url: 'https://notion.so',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://cdn.worldvectorlogo.com/logos/notion-logo-1.svg',
    tags: ['documentation', 'ai-writing', 'requirements', 'collaboration', 'planning'],
    features: [
      'AI-powered content generation',
      'Product requirements templates',
      'Database and project tracking',
      'Real-time collaboration',
      'API integrations',
      'Custom workflows',
      'Knowledge management'
    ],
    integrations: ['JIRA', 'GitHub', 'Slack', 'Figma', 'Google Drive', 'Zapier'],
    target_users: ['Product Managers', 'Technical Writers', 'Engineers', 'Project Managers']
  },
  {
    name: 'Linear',
    description: 'AI-enhanced issue tracking and project management built for modern product teams. Features intelligent prioritization, automated workflows, and seamless design-to-development handoff.',
    website_url: 'https://linear.app',
    github_url: 'https://github.com/linearapp',
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://linear.app/favicon.ico',
    tags: ['project-management', 'issue-tracking', 'ai', 'automation', 'development'],
    features: [
      'AI-powered issue categorization',
      'Intelligent sprint planning',
      'Automated workflow triggers',
      'Git integration and PR tracking',
      'Roadmap visualization',
      'Performance analytics',
      'Slack and Figma integrations'
    ],
    integrations: ['GitHub', 'GitLab', 'Figma', 'Slack', 'Discord', 'Zapier'],
    target_users: ['Product Managers', 'Engineers', 'Project Managers', 'Engineering Managers']
  },
  {
    name: 'Framer AI',
    description: 'AI-powered web design and prototyping tool that generates production-ready code. Bridges the gap between design and development with intelligent component generation.',
    website_url: 'https://framer.com',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://framer.com/favicon.ico',
    tags: ['prototyping', 'ai', 'code-generation', 'design-to-code', 'collaboration'],
    features: [
      'AI website generation',
      'Component-based design system',
      'Real-time collaboration',
      'Production-ready code export',
      'Interactive prototyping',
      'CMS integration',
      'Performance optimization'
    ],
    integrations: ['Figma', 'GitHub', 'Slack', 'Google Analytics', 'Zapier'],
    target_users: ['UX Designers', 'Product Managers', 'Frontend Engineers', 'Marketing Teams']
  },
  {
    name: 'Codeium',
    description: 'AI-powered code completion and collaboration platform that helps engineers implement designs faster. Features context-aware suggestions and team knowledge sharing.',
    website_url: 'https://codeium.com',
    github_url: 'https://github.com/Exafunction/codeium',
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://codeium.com/favicon.ico',
    tags: ['ai-coding', 'code-completion', 'collaboration', 'productivity', 'development'],
    features: [
      'AI-powered code completion',
      'Multi-language support',
      'Team knowledge sharing',
      'Code explanation and documentation',
      'Integration with popular IDEs',
      'Real-time collaboration',
      'Security and privacy focused'
    ],
    integrations: ['VS Code', 'JetBrains IDEs', 'Vim', 'Emacs', 'GitHub', 'GitLab'],
    target_users: ['Engineers', 'Technical Leads', 'Product Engineers', 'DevOps Teams']
  },
  {
    name: 'Whimsical AI',
    description: 'AI-enhanced diagramming and wireframing tool for product teams. Automatically generates user flows, wireframes, and system diagrams from requirements.',
    website_url: 'https://whimsical.com',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://whimsical.com/favicon.ico',
    tags: ['diagramming', 'wireframing', 'ai', 'user-flows', 'product-planning'],
    features: [
      'AI-generated wireframes',
      'Automated user flow creation',
      'Mind mapping with AI suggestions',
      'Collaborative editing',
      'Template library',
      'Export to development tools',
      'Integration with project management'
    ],
    integrations: ['Figma', 'Slack', 'Notion', 'JIRA', 'Confluence'],
    target_users: ['Product Managers', 'UX Designers', 'Business Analysts', 'Project Managers']
  },
  {
    name: 'Gamma AI',
    description: 'AI-powered presentation and documentation platform for product teams. Creates beautiful decks, specifications, and project updates automatically from brief inputs.',
    website_url: 'https://gamma.app',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://gamma.app/favicon.ico',
    tags: ['presentations', 'ai-content', 'documentation', 'product-specs', 'collaboration'],
    features: [
      'AI-generated presentations',
      'Smart content suggestions',
      'Interactive elements',
      'Real-time collaboration',
      'Brand consistency tools',
      'Analytics and engagement tracking',
      'Export to multiple formats'
    ],
    integrations: ['Google Drive', 'Slack', 'Notion', 'Figma', 'Zapier'],
    target_users: ['Product Managers', 'Project Managers', 'Marketing Teams', 'Executives']
  },
  {
    name: 'Productboard AI',
    description: 'AI-enhanced product management platform that automatically prioritizes features, analyzes user feedback, and creates roadmaps. Integrates with development and design tools.',
    website_url: 'https://productboard.com',
    github_url: null,
    pricing_model: 'Paid',
    free_tier: false,
    logo_url: 'https://productboard.com/favicon.ico',
    tags: ['product-management', 'ai', 'roadmapping', 'feedback-analysis', 'prioritization'],
    features: [
      'AI-powered feature prioritization',
      'Automated feedback analysis',
      'Intelligent roadmap generation',
      'Customer insight extraction',
      'Integration with development tools',
      'Stakeholder alignment features',
      'Performance tracking'
    ],
    integrations: ['JIRA', 'GitHub', 'Slack', 'Salesforce', 'Zendesk', 'Intercom'],
    target_users: ['Product Managers', 'Product Owners', 'Engineering Managers', 'Executives']
  },
  {
    name: 'Zeplin AI',
    description: 'AI-powered design handoff platform that automatically generates specs, assets, and code snippets from designs. Streamlines designer-developer collaboration.',
    website_url: 'https://zeplin.io',
    github_url: null,
    pricing_model: 'Freemium',
    free_tier: true,
    logo_url: 'https://zeplin.io/favicon.ico',
    tags: ['design-handoff', 'ai', 'code-generation', 'collaboration', 'specifications'],
    features: [
      'AI-generated design specs',
      'Automatic code snippet generation',
      'Asset optimization',
      'Design system management',
      'Version control integration',
      'Team collaboration tools',
      'Quality assurance features'
    ],
    integrations: ['Figma', 'Sketch', 'Adobe XD', 'GitHub', 'JIRA', 'Slack'],
    target_users: ['UX Designers', 'Frontend Engineers', 'Product Managers', 'QA Teams']
  }
]
