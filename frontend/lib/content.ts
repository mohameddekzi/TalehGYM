/**
 * Central content model for the Taleh GYM public site.
 * In production this is served by the Laravel REST API; here it is typed,
 * realistic seed content so the UI is fully populated and reviewable.
 */

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Membership", href: "/membership" },
  { label: "Training", href: "/training" },
  { label: "Classes", href: "/classes" },
  { label: "Trainers", href: "/trainers" },
  { label: "Branches", href: "/branches" },
  { label: "Contact", href: "/contact" },
];

export const stats = [
  { value: "1,500+", label: "Active members" },
  { value: "2", label: "Branches" },
  { value: "12", label: "Certified coaches" },
  { value: "94%", label: "Renewal rate" },
];

export type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  featured?: boolean;
  perks: string[];
  accent: "orange" | "green" | "blue";
};

export const plans: Plan[] = [
  {
    name: "Starter",
    tagline: "Get moving, build the habit.",
    monthly: 19,
    annual: 190,
    accent: "blue",
    perks: [
      "Full gym floor access",
      "QR digital membership card",
      "Locker & shower facilities",
      "Mobile app & progress tracking",
      "2 guest passes / month",
    ],
  },
  {
    name: "Pro",
    tagline: "The complete Taleh experience.",
    monthly: 39,
    annual: 390,
    featured: true,
    accent: "orange",
    perks: [
      "Everything in Starter",
      "Unlimited group classes",
      "Personalized workout plan",
      "Nutrition & diet plan",
      "Monthly body composition scan",
      "Access to both branches",
    ],
  },
  {
    name: "Elite",
    tagline: "1-on-1 coaching, all-in.",
    monthly: 79,
    annual: 790,
    accent: "green",
    perks: [
      "Everything in Pro",
      "8 personal-training sessions / month",
      "Dedicated coach & weekly check-ins",
      "Recovery & spa access",
      "Priority class booking",
      "InBody assessment every 2 weeks",
    ],
  },
];

export type ClassItem = {
  name: string;
  category: string;
  intensity: "Low" | "Medium" | "High";
  duration: string;
  description: string;
  image: string;
};

const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const classes: ClassItem[] = [
  { name: "Strength Foundations", category: "Strength", intensity: "Medium", duration: "55 min", description: "Barbell mechanics, progressive overload and safe compound lifting.", image: IMG("1534438327276-14e5300c3a48") },
  { name: "HIIT Burn", category: "Conditioning", intensity: "High", duration: "40 min", description: "High-intensity intervals engineered to torch calories fast.", image: IMG("1534258936925-c58bed479fcb") },
  { name: "Power Spin", category: "Cardio", intensity: "High", duration: "45 min", description: "Beat-driven indoor cycling with live performance metrics.", image: IMG("1571019613454-1cb2f99b2d8b") },
  { name: "Mobility & Flow", category: "Recovery", intensity: "Low", duration: "50 min", description: "Yoga-informed mobility to keep joints healthy and pain-free.", image: IMG("1574680096145-d05b474e2155") },
  { name: "Boxing Fit", category: "Combat", intensity: "High", duration: "50 min", description: "Footwork, combinations and conditioning on the bag.", image: IMG("1549060279-7e168fcee0c2") },
  { name: "Core & Stability", category: "Functional", intensity: "Medium", duration: "35 min", description: "Build a bulletproof midline and better posture.", image: IMG("1581009146145-b5ef050c2e1e") },
];

export type Trainer = {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  initials: string;
  accent: "orange" | "green" | "blue";
  photo: string;
};

export const trainers: Trainer[] = [
  { name: "Ayaan Warsame", role: "Head Strength Coach", specialty: "Powerlifting · Hypertrophy", bio: "12 years building champions. Ayaan leads our strength programming across both branches.", initials: "AW", accent: "orange", photo: IMG("1567013127542-490d757e51fc", 600) },
  { name: "Lena Hassan", role: "Performance Nutritionist", specialty: "Nutrition · Body Recomp", bio: "Turns goals into sustainable, food-first plans that actually fit real life.", initials: "LH", accent: "green", photo: IMG("1594381898411-846e7d193883", 600) },
  { name: "Marco Bianchi", role: "Conditioning Coach", specialty: "HIIT · Athletic Performance", bio: "Former pro athlete focused on speed, power and engine work.", initials: "MB", accent: "blue", photo: IMG("1599058917212-d750089bc07e", 600) },
  { name: "Sahra Yusuf", role: "Mobility & Recovery", specialty: "Yoga · Rehab", bio: "Keeps members moving well and training pain-free for the long run.", initials: "SY", accent: "green", photo: IMG("1576678927484-cc907957088c", 600) },
];

export type Branch = {
  city: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  flagship?: boolean;
};

export const branches: Branch[] = [
  { city: "Mogadishu", name: "Iskoyska Taleh GYM", address: "Iskoyska, Mogadishu", hours: "Mon–Sun · 5:00–23:00", phone: "+252 61 000 0001", flagship: true },
  { city: "Mogadishu", name: "Bulaxuubay GYM", address: "Bulaxuubay, Mogadishu", hours: "Mon–Sun · 5:30–22:30", phone: "+252 61 000 0002" },
];

export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  { quote: "Lost 18kg in 6 months. The coach app kept me accountable every single day — I could see my plan, log workouts and message my trainer.", name: "Fadumo A.", detail: "Pro member · Bulaxuubay branch", initials: "FA" },
  { quote: "Best equipment in the city and the staff actually know their stuff. The QR check-in makes mornings effortless.", name: "Omar D.", detail: "Elite member · Iskoyska branch", initials: "OD" },
  { quote: "As a coach, having every client's diet, workout and progress in one dashboard changed how I work. Game changer.", name: "Lena H.", detail: "Performance Coach", initials: "LH" },
];

export const trainingPrograms = [
  { name: "Weight Loss", desc: "Sustainable fat loss with structured cardio, nutrition and habit coaching.", accent: "orange" as const },
  { name: "Muscle Gain", desc: "Hypertrophy-focused programming and protein-led nutrition plans.", accent: "green" as const },
  { name: "Strength", desc: "Progressive barbell strength built on the big compound lifts.", accent: "blue" as const },
  { name: "Athletic Performance", desc: "Speed, power and conditioning for athletes and weekend warriors.", accent: "orange" as const },
];

export const faqs = [
  { q: "Can I freeze my membership?", a: "Yes. Members can freeze their membership for up to 60 days per year directly from the member portal or at any reception desk." },
  { q: "How does the digital membership card work?", a: "Every member gets a QR membership card in the app. Scan it at any branch turnstile to check in and out — your attendance syncs instantly." },
  { q: "Which payment methods do you accept?", a: "We accept EVC Plus, E-Dahab, bank transfer and cash at reception. Renewals can be paid in-app." },
  { q: "Can I use my membership at any branch?", a: "Pro and Elite memberships include access to both Taleh GYM branches in Mogadishu. Starter is single-branch." },
];

export const contact = {
  phone: "+252 61 000 0001",
  email: "hello@talehgym.com",
  whatsapp: "+252 61 000 0001",
  hq: "Iskoyska, Mogadishu, Somalia",
};
