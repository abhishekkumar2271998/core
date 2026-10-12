import { Hero } from "@/components/home/Hero";
import { TechMarquee } from "@/components/home/TechMarquee";
import { StatsCounter } from "@/components/home/StatsCounter";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ProcessStepper } from "@/components/home/ProcessStepper";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { LatestPosts } from "@/components/home/LatestPosts";
import { CallToAction } from "@/components/home/CallToAction";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechMarquee />
      <StatsCounter />
      <FeaturedProjects />
      <ServicesGrid />
      <ProcessStepper />
      <Section className="overflow-hidden">
        <Container>
          <SectionHeader
            eyebrow="Kind words"
            title="What collaborators say"
            description="Engineers, designers and founders I've had the pleasure of building with."
            align="center"
          />
          <TestimonialsCarousel />
        </Container>
      </Section>
      <LatestPosts />
      <CallToAction />
    </>
  );
}
