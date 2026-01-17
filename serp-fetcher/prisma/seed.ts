import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with summarized articles...');

  // Clear existing data
  await prisma.summarizedArticle.deleteMany();

  // Create placeholder summarized articles
  const articles = await Promise.all([
    prisma.summarizedArticle.create({
      data: {
        title: 'AI Models Are Starting to Reason — and It\'s Changing How Software Is Built',
        summary: `Large language models have evolved beyond text generation to demonstrate reasoning capabilities. This shift is fundamentally changing software development, with AI now capable of understanding complex logic and architectural patterns. Developers are leveraging these models for code generation, bug detection, and system design, making them essential tools in the modern development stack.

The implications extend beyond productivity gains. Teams are rethinking their approach to documentation, code reviews, and knowledge sharing. AI reasoning helps junior developers learn faster while helping experienced engineers handle larger, more complex codebases. However, this also raises questions about code security, model hallucinations, and the need for human oversight.

The industry is rapidly adapting, with new workflows and best practices emerging. Companies are investing heavily in AI-assisted development infrastructure, reshaping both hiring and training paradigms. The future of software engineering will likely involve seamless collaboration between human developers and AI systems, each complementing the other's strengths.`,
        source: 'TechCrunch',
        url: 'https://techcrunch.com/article/ai-models-reasoning',
      },
    }),
    prisma.summarizedArticle.create({
      data: {
        title: 'The Rise of Edge Computing in 2024',
        summary: `Edge computing has moved from a niche concept to mainstream infrastructure. By processing data closer to its source, edge computing reduces latency and bandwidth usage while improving privacy. Major cloud providers are now offering edge services, reflecting growing demand from IoT, autonomous vehicles, and real-time applications.

Organizations are discovering unexpected benefits beyond performance. Real-time analytics, reduced cloud costs, and improved offline functionality are driving adoption across industries. Manufacturing plants use edge AI for predictive maintenance, retailers deploy edge systems for personalized experiences, and telecom companies optimize 5G networks with edge processing.

As edge computing matures, standardization and tooling are becoming critical. DevOps teams face new challenges managing distributed systems, requiring new monitoring, deployment, and security strategies. The convergence of edge and cloud computing is creating a hybrid future where workloads intelligently move between environments based on real-time needs.`,
        source: 'VentureBeat',
        url: 'https://venturebeat.com/article/edge-computing-2024',
      },
    }),
    prisma.summarizedArticle.create({
      data: {
        title: 'How to Build Scalable APIs in 2024',
        summary: `Scalable API design requires rethinking traditional architectural patterns. Modern APIs must handle billions of requests while maintaining low latency and high availability. GraphQL, gRPC, and event-driven architectures are emerging as alternatives to REST, each with distinct advantages for different use cases.

Caching strategies have become crucial for API performance. Advanced techniques like cache invalidation patterns, CDN optimization, and in-memory stores help reduce database load and improve response times. Companies like Netflix and Uber have published extensive research on their API optimization journeys, providing blueprints for other organizations.

Observability and monitoring are no longer afterthoughts but foundational requirements. Distributed tracing, metrics collection, and error tracking help teams quickly identify bottlenecks and failures. API-first development methodologies are enabling faster iteration cycles, allowing teams to deploy and scale with confidence.`,
        source: 'Medium',
        url: 'https://medium.com/scalable-apis-2024',
      },
    }),
    prisma.summarizedArticle.create({
      data: {
        title: 'Security Best Practices for Cloud-Native Applications',
        summary: `Cloud-native security requires a zero-trust approach where every request is verified. Container security, image scanning, and runtime protection have become essential. Organizations must implement security controls at every layer—from code repositories to production workloads—to prevent vulnerabilities from reaching users.

Compliance and governance in cloud environments are increasingly complex. Regulations like GDPR, CCPA, and SOC 2 require specific security measures and audit trails. Many organizations are adopting compliance-as-code, where security policies are versioned and tested like application code. This approach enables rapid compliance updates and reduces manual overhead.

Incident response and disaster recovery planning are critical for cloud applications. Teams must establish clear playbooks for security breaches, perform regular disaster recovery drills, and maintain detailed incident documentation. The shared responsibility model means organizations remain accountable for their security posture despite relying on cloud providers.`,
        source: 'Security Weekly',
        url: 'https://securityweekly.com/cloud-native-security',
      },
    }),
    prisma.summarizedArticle.create({
      data: {
        title: 'The Future of Remote Work Technologies',
        summary: `Remote work has matured beyond video calls. Asynchronous communication tools, digital collaboration spaces, and AI-powered transcription are reshaping how distributed teams operate. Companies are investing in virtual offices that replicate in-person experiences, complete with spontaneous interactions and ambient awareness.

The technology stack for remote work is becoming increasingly sophisticated. Context switching between applications is being addressed by unified platforms that integrate communication, project management, and knowledge sharing. Integration with calendar systems, automatic meeting summaries, and AI-assisted scheduling reduce cognitive load on knowledge workers.

Mental health and team cohesion remain critical challenges. Technologies like spatial audio, virtual backgrounds that enhance privacy, and wellness monitoring tools address the human side of remote work. Forward-thinking companies are using technology to build stronger remote cultures rather than simply replicating office experiences digitally.`,
        source: 'Harvard Business Review',
        url: 'https://hbr.org/future-remote-work',
      },
    }),
    prisma.summarizedArticle.create({
      data: {
        title: 'Sustainability and Tech: Building Green Data Centers',
        summary: `Data centers consume massive amounts of electricity, making energy efficiency critical for environmental sustainability. Tech giants are investing in renewable energy, advanced cooling systems, and chip-level optimizations to reduce carbon footprints. Green data centers are no longer optional—they're becoming a competitive advantage and regulatory requirement.

Software optimization plays an equally important role. Writing efficient code, optimizing algorithms, and reducing unnecessary computations directly impact energy consumption. Developers are increasingly considering environmental impact as part of their responsibility, with tools emerging to measure and track application energy usage.

The industry is moving toward carbon-aware computing, where applications automatically shift workloads to regions with cleaner energy sources. This requires real-time visibility into energy grids and automated systems that balance performance with sustainability goals. As climate regulations tighten, sustainability will become a central design principle in tech.`,
        source: 'TechCrunch',
        url: 'https://techcrunch.com/green-data-centers',
      },
    }),
  ]);

  console.log(`✅ Seeded ${articles.length} summarized articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
