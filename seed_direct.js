const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://yh809840_db_user:FCeK0XmecaDMG4P2@cluster0.edwdbhy.mongodb.net/krawia_portfolio?retryWrites=true&w=majority";

const BlueprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    location: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, required: true },
    coverImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    blueprints: { type: [BlueprintSchema], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  const projects = [
    {
      title: "مشروع برج الأمل السكني",
      slug: "mshrwaa-brj-l-ml-lskny",
      description: "مجمع سكني فاخر يتكون من 30 طابقاً بتصميم معماري فريد وإطلالات بانورامية على مدينة الرياض.",
      fullDescription: `مشروع برج الأمل السكني هو أحد أبرز مشاريع أسماء كراوية للتطوير العقاري. يمتد المشروع على مساحة 15,000 متر مربع ويضم شققاً سكنية فاخرة بنظام المنازل الذكية.`,
      location: "الرياض - حي حطين",
      category: "residential",
      status: "under-construction",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
      ],
      blueprints: [
        {
          name: "المخطط المعماري الرئيسي",
          pdfUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
          thumbnailUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"
        }
      ],
      featured: true,
    },
    {
      title: "مركز كراوية للأعمال",
      slug: "mrkz-krawya-llaamal",
      description: "برج تجاري متكامل يقع في قلب العاصمة يضم مكاتب حديثة ومساحات للمتاجر الفاخرة.",
      fullDescription: "مركز كراوية للأعمال صمم ليكون مركزاً للشركات العالمية والمحلية الرائدة في بيئة عمل متطورة وعصرية.",
      location: "الرياض - حي العليا",
      category: "commercial",
      status: "completed",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80"
      ],
      blueprints: [],
      featured: true,
    },
    {
      title: "منتجع الواحة السكني",
      slug: "mntja-lwaha-lskny",
      description: "فلل سكنية فاخرة تحيط بها الحدائق والمساحات الخضراء والبحيرات الاصطناعية.",
      fullDescription: "يقدم منتجع الواحة مفهومًا جديدًا للعيش الراقي المترف بين أحضان الطبيعة مع أقصى درجات الخصوصية.",
      location: "جدة - حي الشاطئ",
      category: "residential",
      status: "upcoming",
      coverImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      gallery: [],
      blueprints: [],
      featured: false,
    }
  ];

  for (const proj of projects) {
    await Project.updateOne({ slug: proj.slug }, { $setOnInsert: proj }, { upsert: true });
  }
  console.log("Successfully ensured default projects exist in MongoDB Atlas without deleting user projects!");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Error seeding MongoDB:", err);
  process.exit(1);
});
