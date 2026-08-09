import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSample } from "@/models/SiteSample";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

function getCategoryLabel(category: string): string {
  switch (category) {
    case "interiors":
      return "تشطيبات وديكورات فاخرة";
    case "execution":
      return "تنفيذ وتطوير معماري";
    case "lighting":
      return "إضاءات وديكورات حديثة";
    default:
      return "تشطيبات وديكورات فاخرة";
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    let samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();

    if (samples.length === 0) {
      // Auto-seed initial samples
      await SiteSample.insertMany(INITIAL_SAMPLES_SEED);
      samples = await SiteSample.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(samples)),
    });
  } catch (error: unknown) {
    console.error("GET /api/site-samples error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, imageSrc, location } = body || {};

    if (!title || !imageSrc || typeof title !== "string" || typeof imageSrc !== "string") {
      return NextResponse.json(
        { success: false, error: "عنوان العينة وصورة العينة مطلوبان" },
        { status: 400 }
      );
    }

    const validCategory = ["interiors", "execution", "lighting"].includes(category)
      ? category
      : "interiors";

    await connectToDatabase();

    const newSample = await SiteSample.create({
      title: title.trim(),
      category: validCategory,
      categoryLabel: getCategoryLabel(validCategory),
      imageSrc: imageSrc.trim(),
      location: location && typeof location === "string" ? location.trim() : "دمنهور - شارع الضغط العالي",
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة عينة العمل الجديدة بنجاح",
        data: JSON.parse(JSON.stringify(newSample)),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/site-samples error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة العينة" }, { status: 500 });
  }
}
