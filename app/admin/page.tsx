import { getAllProjects } from "@/lib/projects";
import AdminDashboardView from "@/components/AdminDashboardView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const projects = await getAllProjects();

  return <AdminDashboardView initialProjects={projects} />;
}
