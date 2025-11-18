import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: 'We reduced lead generation costs by 60% using Swarm Sync agents.',
    author: 'Sarah Chen',
    role: 'VP Sales, TechCorp',
    company: 'TechCorp',
  },
  {
    quote: 'The certification system gave us confidence in every agent we hired.',
    author: 'Marcus Johnson',
    role: 'Operations Lead, FinServe',
    company: 'FinServe',
  },
  {
    quote: 'Multi-agent workflows cut our processing time from hours to minutes.',
    author: 'Elena Rodriguez',
    role: 'Engineering Manager, DataFlow',
    company: 'DataFlow',
  },
];

const trustedBy = [
  'AI/ML Startups',
  'Enterprise Tech',
  'Research Labs',
  'SaaS Companies',
];

export function SocialProof() {
  return (
    <section className="bg-white/40 px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Trusted By */}
        <div className="text-center space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Trusted By Engineering Teams At
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-ink-muted font-body">
            {trustedBy.map((company) => (
              <div
                key={company}
                className="rounded-xl border border-brass/20 bg-white/60 px-6 py-3"
              >
                <span className="text-sm font-medium">{company}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <h2 className="text-center text-3xl font-headline text-foreground">
            What Teams Are Saying
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.author}
                className="border-white/70 bg-white/80 transition-shadow hover:shadow-brand-panel"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="text-brass text-3xl">"</div>
                  <p className="font-body text-base italic text-ink">
                    {testimonial.quote}
                  </p>
                  <div className="border-t border-brass/20 pt-4">
                    <p className="font-body font-semibold text-ink">
                      {testimonial.author}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
