import { connectToDatabase } from "@/lib/db";
import { SiteSample } from "@/models/SiteSample";
import AdminSamplesView from "@/components/AdminSamplesView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INITIAL_SAMPLES_SEED = [
  {
    title: "تشطيبات فاخرة وتصاميم أسقف حديثة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0030.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "تنفيذ وإشراف معماري شامل",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0031.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "إضاءات مخفية وديكورات مودرن",
    category: "lighting",
    categoryLabel: "إضاءات وديكورات حديثة",
    imageSrc: "/img/site-images/IMG-20260809-WA0032.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "تصميم غرف وصالات فاخرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0033.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "تجهيز مساحات سكنية متكاملة",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0034.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "لمسات ديكورية راقية وخامات نادرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0035.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "توزيع إضاءة ذكي ومساحات معمارية",
    category: "lighting",
    categoryLabel: "إضاءات وديكورات حديثة",
    imageSrc: "/img/site-images/IMG-20260809-WA0036.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "تشطيبات أجنحة ومجموعات فاخرة",
    category: "interiors",
    categoryLabel: "تشطيبات وديكورات فاخرة",
    imageSrc: "/img/site-images/IMG-20260809-WA0037.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
  {
    title: "استغلال مساحات وهندسة تفاصيل",
    category: "execution",
    categoryLabel: "تنفيذ وتطوير معماري",
    imageSrc: "/img/site-images/IMG-20260809-WA0038.jpg",
    location: "دمنهور - شارع الضغط العالي",
  },
];

export default async function AdminSamplesPage() {
  await connectToDatabase();
  let samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();

  if (samples.length === 0) {
    await SiteSample.insertMany(INITIAL_SAMPLES_SEED);
    samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();
  }

  const serializedSamples = JSON.parse(JSON.stringify(samples));

  return <AdminSamplesView initialSamples={serializedSamples} />;
}
