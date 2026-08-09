import { connectToDatabase } from "@/lib/db";
import { AccessCode, IAccessCodeData } from "@/models/AccessCode";
import AdminAccessCodesView from "@/components/AdminAccessCodesView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAccessCodesPage() {
  await connectToDatabase();

  const codesRaw = await AccessCode.find()
    .sort({ createdAt: -1 })
    .lean();

  const initialCodes: IAccessCodeData[] = JSON.parse(JSON.stringify(codesRaw));

  return <AdminAccessCodesView initialCodes={initialCodes} />;
}
