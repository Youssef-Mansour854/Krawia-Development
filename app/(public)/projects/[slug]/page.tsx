import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import ProjectDetailView from "@/components/ProjectDetailView";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <ProjectDetailView project={project} />
    </>
  );
}
