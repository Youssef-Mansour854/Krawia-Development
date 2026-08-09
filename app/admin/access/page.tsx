import { connectToDatabase } from "@/lib/db";
import { AccessCode, IAccessCode } from "@/models/AccessCode";
import AdminAccessCodesView from "@/components/AdminAccessCodesView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAccessCodesPage() {
  await connectToDatabase();

  const codesRaw = await AccessCode.find()
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const initialCodes: IAccessCode[] = JSON.parse(JSON.stringify(codesRaw));

  return <AdminAccessCodesView initialCodes={initialCodes} />;
}
