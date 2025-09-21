import type { InvestmentMemo, CallRequest, MeetingSchedule, Notification } from '@/types'

export const mockInvestmentMemo: InvestmentMemo = {
  id: 'memo-1',
  companyId: '1',
  version: '2.1',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  overview: {
    id: '1',
    name: 'TechFlow AI',
    description: 'TechFlow AI is revolutionizing enterprise workflow automation through advanced artificial intelligence and machine learning technologies. Our platform helps businesses streamline their operations, reduce manual tasks, and increase productivity by up to 40%. We serve Fortune 500 companies across various industries including finance, healthcare, and manufacturing.',
    sector: 'AI/ML',
    stage: 'series-a',
    foundedYear: 2022,
    location: 'San Francisco, CA',
    website: 'https://techflow.ai',
    logo: '/logos/techflow.png',
    tagline: 'Automate your workflow with AI',
    employeeCount: 45,
    fundingRaised: 12000000,
    valuation: 50000000
  },
  marketAnalysis: {
    marketSize: {
      current: 15000000000,
      projected: 45000000000,
      year: 2028,
      currency: 'USD'
    },
    growthRate: 28.5,
    marketTrends: [
      'Increasing adoption of AI automation in enterprise workflows',
      'Growing demand for no-code/low-code solutions',
      'Rising focus on operational efficiency and cost reduction',
      'Expansion of AI capabilities in document processing',
      'Integration with existing enterprise software ecosystems'
    ],
    chartData: [
      { year: 2022, marketSize: 15000000000, companyRevenue: 2500000 },
      { year: 2023, marketSize: 19000000000, companyRevenue: 8500000 },
      { year: 2024, marketSize: 24000000000, companyRevenue: 15000000 },
      { year: 2025, marketSize: 30000000000, companyRevenue: 25000000 },
      { year: 2026, marketSize: 36000000000, companyRevenue: 38000000 },
      { year: 2027, marketSize: 42000000000, companyRevenue: 55000000 },
      { year: 2028, marketSize: 45000000000, companyRevenue: 75000000 }
    ],
    competitivePosition: 'challenger'
  },
  founders: [
    {
      id: 'founder-1',
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Sarah is a seasoned entrepreneur with over 12 years of experience in AI and enterprise software. She previously led product development at Google Cloud AI and was instrumental in launching several successful AI products. Sarah holds a PhD in Computer Science from Stanford and has published over 20 research papers in machine learning.',
      profileImage: '/founders/sarah-chen.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen_ai',
        github: 'https://github.com/sarahchen'
      },
      experience: [
        {
          company: 'Google Cloud AI',
          role: 'Senior Product Manager',
          duration: '2019-2022',
          description: 'Led the development of AutoML and AI Platform products, managing a team of 15 engineers and driving $50M+ in annual revenue.'
        },
        {
          company: 'Microsoft Azure',
          role: 'Principal Program Manager',
          duration: '2016-2019',
          description: 'Spearheaded the Azure Cognitive Services initiative, launching 8 new AI APIs and achieving 300% user growth.'
        },
        {
          company: 'Palantir Technologies',
          role: 'Software Engineer',
          duration: '2014-2016',
          description: 'Developed data integration and analytics platforms for Fortune 500 clients in finance and healthcare sectors.'
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'PhD in Computer Science (AI/ML)',
          year: 2014
        },
        {
          institution: 'MIT',
          degree: 'MS in Computer Science',
          year: 2010
        }
      ],
      achievements: [
        'Named in Forbes 30 Under 30 for Enterprise Technology (2020)',
        'Published 20+ peer-reviewed papers in top-tier AI conferences',
        'Holds 8 patents in machine learning and automation',
        'Keynote speaker at major AI conferences (NeurIPS, ICML, ICLR)',
        'Led teams that generated $100M+ in enterprise AI revenue'
      ],
      redFlags: []
    },
    {
      id: 'founder-2',
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Marcus is a technical visionary with deep expertise in distributed systems and machine learning infrastructure. He previously architected scalable AI systems at Netflix and Uber, handling billions of daily transactions. Marcus is passionate about building robust, production-ready AI systems that can scale globally.',
      profileImage: '/founders/marcus-rodriguez.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/marcusrodriguez',
        github: 'https://github.com/marcusrodriguez'
      },
      experience: [
        {
          company: 'Netflix',
          role: 'Senior Staff Engineer',
          duration: '2020-2022',
          description: 'Architected the recommendation engine infrastructure serving 200M+ users, improving engagement by 25%.'
        },
        {
          company: 'Uber',
          role: 'Principal Engineer',
          duration: '2017-2020',
          description: 'Built the real-time pricing and matching algorithms, processing 15M+ rides daily across 70+ countries.'
        },
        {
          company: 'Facebook (Meta)',
          role: 'Senior Software Engineer',
          duration: '2015-2017',
          description: 'Developed machine learning infrastructure for News Feed ranking, serving 2B+ users globally.'
        }
      ],
      education: [
        {
          institution: 'Carnegie Mellon University',
          degree: 'MS in Computer Science',
          year: 2015
        },
        {
          institution: 'UC Berkeley',
          degree: 'BS in Electrical Engineering',
          year: 2013
        }
      ],
      achievements: [
        'Architected systems handling 10B+ daily ML predictions',
        'Open source contributor with 50K+ GitHub stars',
        'Technical advisor to 3 successful AI startups',
        'Speaker at major tech conferences (QCon, Strange Loop)',
        'Holds 5 patents in distributed ML systems'
      ],
      redFlags: [
        'Limited experience in early-stage startup environments',
        'Previous role focused more on infrastructure than product development'
      ]
    }
  ],
  competition: {
    competitors: [
      {
        name: 'UiPath',
        description: 'Leading robotic process automation platform with enterprise focus',
        fundingRaised: 2000000000,
        marketShare: 35,
        strengths: [
          'Market leader with strong brand recognition',
          'Comprehensive RPA platform with extensive integrations',
          'Large enterprise customer base',
          'Strong partner ecosystem'
        ],
        weaknesses: [
          'Complex setup and implementation process',
          'High pricing for smaller businesses',
          'Limited AI capabilities compared to newer solutions',
          'Steep learning curve for non-technical users'
        ]
      },
      {
        name: 'Automation Anywhere',
        description: 'Cloud-native intelligent automation platform',
        fundingRaised: 840000000,
        marketShare: 25,
        strengths: [
          'Cloud-first architecture',
          'Strong AI and ML capabilities',
          'User-friendly interface',
          'Good customer support'
        ],
        weaknesses: [
          'Smaller market presence than UiPath',
          'Limited industry-specific solutions',
          'Newer platform with less proven track record',
          'Higher competition in mid-market segment'
        ]
      },
      {
        name: 'Blue Prism',
        description: 'Enterprise-grade intelligent automation platform',
        fundingRaised: 150000000,
        marketShare: 15,
        strengths: [
          'Strong security and governance features',
          'Excellent for highly regulated industries',
          'Robust enterprise architecture',
          'Good scalability for large deployments'
        ],
        weaknesses: [
          'Complex and expensive implementation',
          'Limited cloud capabilities',
          'Slower innovation compared to competitors',
          'Requires significant technical expertise'
        ]
      }
    ],
    competitiveAdvantages: [
      'AI-first approach with advanced natural language processing',
      'No-code interface accessible to business users',
      'Faster implementation time (weeks vs months)',
      'Significantly lower total cost of ownership',
      'Industry-specific pre-built workflows and templates',
      'Real-time analytics and performance monitoring'
    ],
    marketPosition: 'TechFlow AI is positioned as an innovative challenger in the enterprise automation space, focusing on AI-native solutions that are more accessible and cost-effective than traditional RPA platforms. While established players like UiPath dominate the market, TechFlow AI is capturing market share by targeting mid-market companies and offering superior user experience with faster deployment times.'
  },
  kpis: {
    revenue: {
      current: 15000000,
      growth: 185.5,
      recurring: 13500000
    },
    customers: {
      total: 450,
      growth: 125.8,
      churn: 3.2
    },
    sectorSpecific: {
      averageContractValue: 180000,
      customerLifetimeValue: 850000,
      salesCycleLength: 4.5,
      netPromoterScore: 72,
      productAdoptionRate: 89,
      apiCallsPerMonth: 25000000,
      automationsSaved: 1200000,
      timeToValue: 3.2
    }
  },
  riskAssessment: {
    riskLevel: 'medium',
    categories: {
      market: {
        level: 'medium',
        factors: [
          'Intense competition from established RPA vendors',
          'Market consolidation risk as larger players acquire smaller ones',
          'Economic downturn could reduce enterprise automation spending',
          'Rapid technological changes requiring continuous innovation'
        ]
      },
      financial: {
        level: 'low',
        factors: [
          'Strong revenue growth and recurring revenue model',
          'Healthy gross margins above 80%',
          'Sufficient runway with current funding',
          'Diversified customer base reducing concentration risk'
        ]
      },
      operational: {
        level: 'medium',
        factors: [
          'Scaling challenges as customer base grows rapidly',
          'Need to hire and retain top AI/ML talent in competitive market',
          'Maintaining product quality while expanding feature set',
          'Building robust infrastructure to handle enterprise-scale deployments'
        ]
      },
      team: {
        level: 'low',
        factors: [
          'Strong technical leadership with proven track records',
          'Complementary skill sets between co-founders',
          'Growing team with relevant industry experience',
          'Clear vision and execution capability demonstrated'
        ]
      }
    },
    redFlags: [
      'High customer acquisition costs in competitive market',
      'Dependence on third-party AI models and cloud infrastructure',
      'Limited international presence compared to global competitors'
    ],
    mitigationStrategies: [
      'Develop proprietary AI models to reduce third-party dependencies and improve margins',
      'Establish strategic partnerships with system integrators to accelerate market penetration',
      'Invest in international expansion starting with English-speaking markets',
      'Build a strong customer success team to reduce churn and increase expansion revenue',
      'Develop industry-specific solutions to differentiate from generic automation platforms',
      'Create a robust partner ecosystem to extend market reach and reduce direct sales costs'
    ]
  },
  recommendation: {
    score: 78,
    reasoning: 'TechFlow AI presents a compelling investment opportunity in the rapidly growing enterprise automation market. The company demonstrates strong product-market fit with impressive revenue growth (185% YoY) and healthy unit economics. The founding team brings exceptional technical expertise from leading tech companies, and their AI-first approach differentiates them from traditional RPA vendors. While the market is competitive, TechFlow AI\'s focus on accessibility and faster implementation creates a clear value proposition for mid-market customers. The main risks are execution-related as the company scales, but the strong fundamentals and market opportunity justify the investment.',
    investmentThesis: 'Enterprise workflow automation is undergoing a paradigm shift from rule-based RPA to AI-native solutions. TechFlow AI is well-positioned to capture this transition with their innovative platform that combines advanced AI capabilities with user-friendly design. The $45B projected market size by 2028, coupled with the company\'s proven ability to acquire and retain customers, creates a significant opportunity for returns. The investment aligns with the thesis that AI-first automation platforms will eventually replace traditional RPA solutions, and TechFlow AI has the team and technology to be a market leader in this transition.'
  }
}
// 
// Mock call requests for demonstration
export const mockCallRequests: CallRequest[] = [
  {
    id: 'call-req-1',
    investorId: 'investor-1',
    investorName: 'Sarah Johnson',
    companyId: '1',
    message: 'I\'m very interested in TechFlow AI\'s approach to enterprise automation. Would love to discuss potential investment opportunities and learn more about your growth strategy.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'pending'
  },
  {
    id: 'call-req-2',
    investorId: 'investor-2',
    investorName: 'Michael Chen',
    companyId: '1',
    message: 'Your AI-first automation platform aligns perfectly with our investment thesis. I\'d like to schedule a call to discuss Series A participation.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: 'accepted'
  },
  {
    id: 'call-req-3',
    investorId: 'investor-3',
    investorName: 'Emily Rodriguez',
    companyId: '1',
    message: 'Impressed by your traction and team background. Would like to explore investment opportunities.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'declined'
  }
]

// Mock scheduled meetings
export const mockMeetings: MeetingSchedule[] = [
  {
    id: 'meeting-1',
    callRequestId: 'call-req-2',
    investorId: 'investor-2',
    founderId: 'founder-1',
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 45,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    notes: 'Series A discussion - focus on growth strategy and market expansion'
  },
  {
    id: 'meeting-2',
    callRequestId: 'call-req-4',
    investorId: 'investor-4',
    founderId: 'founder-1',
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration: 30,
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'scheduled',
    notes: 'Initial investment discussion'
  }
]

// Mock notifications for call requests
export const mockCallNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'call-request',
    title: 'New Call Request',
    message: 'Sarah Johnson wants to schedule a call to discuss investment opportunities',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    userId: 'founder-1',
    metadata: {
      callRequest: mockCallRequests[0],
      requestId: 'call-req-1'
    }
  },
  {
    id: 'notif-2',
    type: 'call-response',
    title: 'Call Request Accepted',
    message: 'TechFlow AI has accepted your call request. You can now schedule a meeting.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    userId: 'investor-2',
    metadata: {
      callResponse: {
        requestId: 'call-req-2',
        status: 'accepted',
        message: 'Thank you for your interest! I\'m available for a call this week.'
      }
    }
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Meeting Scheduled',
    message: 'Your meeting with Michael Chen has been scheduled for tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: true,
    userId: 'founder-1',
    metadata: {
      meetingId: 'meeting-1'
    }
  }
]

// Mock investor profiles for call requests
export const mockInvestors = [
  {
    id: 'investor-1',
    name: 'Sarah Johnson',
    firm: 'Accel Partners',
    title: 'Principal',
    avatar: '/investors/sarah-johnson.jpg',
    focusAreas: ['AI/ML', 'Enterprise Software', 'B2B SaaS'],
    investmentRange: '$5M - $25M',
    portfolio: ['Slack', 'Atlassian', 'Dropbox']
  },
  {
    id: 'investor-2',
    name: 'Michael Chen',
    firm: 'Sequoia Capital',
    title: 'Partner',
    avatar: '/investors/michael-chen.jpg',
    focusAreas: ['Enterprise AI', 'Automation', 'Developer Tools'],
    investmentRange: '$10M - $50M',
    portfolio: ['GitHub', 'Docker', 'Zoom']
  },
  {
    id: 'investor-3',
    name: 'Emily Rodriguez',
    firm: 'Andreessen Horowitz',
    title: 'General Partner',
    avatar: '/investors/emily-rodriguez.jpg',
    focusAreas: ['AI Infrastructure', 'Enterprise Software', 'Future of Work'],
    investmentRange: '$15M - $100M',
    portfolio: ['Databricks', 'PagerDuty', 'Okta']
  }
]