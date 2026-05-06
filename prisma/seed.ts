import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (SQLite: disable FK checks, delete in reverse dependency order)
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");
  for (const model of [
    "lease","payment","booking","lead","improvement","valuation",
    "unit","project","investment","tenant","property","neighborhood",
    "session","account","company","user",
  ] as const) {
    await (prisma[model] as { deleteMany: () => Promise<unknown> }).deleteMany();
  }
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  const pw = await bcrypt.hash("demo", 10);

  // ── Users ────────────────────────────────────────────────────────────────────
  const landlord  = await prisma.user.create({ data: { name: "Adaeze Okafor",      email: "landlord@willow.ng",  password: pw, role: "LANDLORD",  phone: "+234 801 234 5678" } });
  const investor  = await prisma.user.create({ data: { name: "Emeka Nwosu",        email: "investor@willow.ng",  password: pw, role: "INVESTOR",  phone: "+234 802 345 6789" } });
  const developer  = await prisma.user.create({ data: { name: "Tunde Adeleke",  email: "developer@willow.ng",  password: pw, role: "DEVELOPER", phone: "+234 803 456 7890" } });
  const developer2 = await prisma.user.create({ data: { name: "Kemi Afolabi",   email: "developer2@willow.ng", password: pw, role: "DEVELOPER", phone: "+234 803 987 6543" } });
  const agent     = await prisma.user.create({ data: { name: "Seun Fadahunsi",     email: "agent@willow.ng",     password: pw, role: "AGENT",     phone: "+234 804 567 8901" } });
  const buyer     = await prisma.user.create({ data: { name: "Ngozi Eze",          email: "buyer@willow.ng",     password: pw, role: "BUYER",     phone: "+234 805 678 9012" } });
  const admin     = await prisma.user.create({ data: { name: "Willow Admin",       email: "admin@willow.ng",     password: pw, role: "ADMIN",     phone: "+234 806 789 0123" } });

  console.log(`✓ 6 users created (landlord, investor, developer, agent, buyer, admin)`);

  // ── Companies ────────────────────────────────────────────────────────────────
  const co1 = await prisma.company.create({ data: { ownerId: developer.id, name: "Adeleke Homes & Properties",   type: "DEVELOPER", city: "Lagos", totalUnits: 96 } });
  const co2 = await prisma.company.create({ data: { ownerId: developer2.id, name: "Apex Real Estate Development", type: "DEVELOPER", city: "Abuja", totalUnits: 96 } });

  // ── Properties ───────────────────────────────────────────────────────────────
  const p1 = await prisma.property.create({ data: { ownerId: landlord.id, title: "Panorama Heights Penthouse",   location: "15 Bourdillon Road, Ikoyi",         city: "Lagos",         state: "Lagos State",  propertyType: "PENTHOUSE",  bedrooms: 4, bathrooms: 4, sqm: 420,  currentValue: 480000000n, listingType: "RENT",     price: 3500000n,   roiPercent: 8.75,  uosScore: 87, yearBuilt: 2022, features: JSON.stringify(["Pool","Smart Home","Gym","Concierge","Generator","CCTV"]),  images: JSON.stringify([]) } });
  const p2 = await prisma.property.create({ data: { ownerId: landlord.id, title: "Victoria Crown Luxury Apt",    location: "Plot 45, Ozumba Mbadiwe, VI",       city: "Lagos",         state: "Lagos State",  propertyType: "APARTMENT",  bedrooms: 3, bathrooms: 3, sqm: 185,  currentValue: 280000000n, listingType: "RENT",     price: 2200000n,   roiPercent: 9.43,  uosScore: 76, yearBuilt: 2020, features: JSON.stringify(["AC","Generator","Security","Parking","Elevator"]),           images: JSON.stringify([]) } });
  const p3 = await prisma.property.create({ data: { ownerId: landlord.id, title: "Maitama Executive Villa",      location: "12 Niger Crescent, Maitama",        city: "Abuja",         state: "FCT",          propertyType: "VILLA",      bedrooms: 5, bathrooms: 5, sqm: 650,  currentValue: 650000000n, listingType: "RENT",     price: 4800000n,   roiPercent: 8.86,  uosScore: 92, yearBuilt: 2019, features: JSON.stringify(["Pool","Guest Chalet","Solar","Cinema","Tennis Court"]),      images: JSON.stringify([]) } });
  const p4 = await prisma.property.create({ data: { ownerId: investor.id, title: "Lekki Phase 1 Shortlet Block", location: "23 Admiralty Way, Lekki Phase 1",  city: "Lagos",         state: "Lagos State",  propertyType: "APARTMENT",  bedrooms: 2, bathrooms: 2, sqm: 120,  currentValue: 185000000n, listingType: "SHORTLET", price: 85000n,     roiPercent: 16.7,  uosScore: 68, yearBuilt: 2018, features: JSON.stringify(["AC","WiFi","Generator","Security"]),                         images: JSON.stringify([]) } });
  const p5 = await prisma.property.create({ data: { ownerId: investor.id, title: "Asokoro Heights Premium Suite", location: "8 Aso Drive, Asokoro",             city: "Abuja",         state: "FCT",          propertyType: "APARTMENT",  bedrooms: 2, bathrooms: 2, sqm: 145,  currentValue: 220000000n, listingType: "RENT",     price: 1800000n,   roiPercent: 9.82,  uosScore: 79, yearBuilt: 2021, features: JSON.stringify(["AC","Generator","CCTV","Gym","Concierge"]),                  images: JSON.stringify([]) } });
  const p6 = await prisma.property.create({ data: { ownerId: landlord.id, title: "GRA Port Harcourt Duplex",     location: "15 Tombia Street, GRA Phase 2",     city: "Port Harcourt", state: "Rivers State", propertyType: "DUPLEX",     bedrooms: 4, bathrooms: 3, sqm: 280,  currentValue: 320000000n, listingType: "RENT",     price: 2800000n,   roiPercent: 10.5,  uosScore: 71, yearBuilt: 2016, features: JSON.stringify(["Security","Generator","BQ","Garden"]),                       images: JSON.stringify([]) } });
  const p7 = await prisma.property.create({ data: { ownerId: investor.id, title: "Wuse 2 Commercial Property",   location: "Plot 1234, Aminu Kano Crescent",    city: "Abuja",         state: "FCT",          propertyType: "COMMERCIAL", bedrooms: 0, bathrooms: 4, sqm: 850,  currentValue: 980000000n, listingType: "BUY",      price: 980000000n, roiPercent: 12.4,  uosScore: 83, yearBuilt: 2015, features: JSON.stringify(["Elevator","Generator","50-car Park","CCTV"]),                images: JSON.stringify([]) } });
  const p8 = await prisma.property.create({ data: { ownerId: investor.id, title: "Oniru Waterfront Townhouse",   location: "10 Kofo Abayomi St, VI Extension",  city: "Lagos",         state: "Lagos State",  propertyType: "TOWNHOUSE",  bedrooms: 4, bathrooms: 4, sqm: 380,  currentValue: 750000000n, listingType: "SHORTLET", price: 180000n,    roiPercent: 14.2,  uosScore: 90, yearBuilt: 2023, features: JSON.stringify(["Waterfront","Pool","Smart Home","Cinema"]),                  images: JSON.stringify([]) } });

  console.log(`✓ 8 properties created`);

  // ── Tenants ──────────────────────────────────────────────────────────────────
  const t1 = await prisma.tenant.create({ data: { propertyId: p1.id, landlordId: landlord.id, name: "Chidi Okeke",              email: "chidi@techcorp.ng",  phone: "+234 812 345 6789", rentAmount: 3500000n, leaseStart: new Date("2024-01-15"), leaseEnd: new Date("2025-01-14"), status: "ACTIVE"  } });
  const t2 = await prisma.tenant.create({ data: { propertyId: p2.id, landlordId: landlord.id, name: "Ngozi Eze-P",              email: "ngozi@firstbank.ng", phone: "+234 813 456 7890", rentAmount: 2200000n, leaseStart: new Date("2023-10-01"), leaseEnd: new Date("2024-09-30"), status: "NOTICE"  } });
  const t3 = await prisma.tenant.create({ data: { propertyId: p3.id, landlordId: landlord.id, name: "Ambassador J. Harrington", email: "jh@ukembassy.gov",   phone: "+234 814 567 8901", rentAmount: 4800000n, leaseStart: new Date("2024-03-01"), leaseEnd: new Date("2025-02-28"), status: "ACTIVE"  } });
  const t4 = await prisma.tenant.create({ data: { propertyId: p6.id, landlordId: landlord.id, name: "Dr. Ibifuro Princewill",  email: "dr.p@hospital.ng",   phone: "+234 815 678 9012", rentAmount: 2800000n, leaseStart: new Date("2023-07-01"), leaseEnd: new Date("2024-06-30"), status: "EXPIRED" } });
  await prisma.tenant.create({ data: { propertyId: p5.id, landlordId: investor.id, name: "Fatima Al-Hassan", email: "fatima@govt.ng", phone: "+234 816 789 0123", rentAmount: 1800000n, leaseStart: new Date("2024-04-01"), leaseEnd: new Date("2025-03-31"), status: "ACTIVE" } });

  // ── Payments ─────────────────────────────────────────────────────────────────
  const pairs = [
    { p: p1.id, t: t1.id, amt: 3500000n, overdueIdx: 9 },
    { p: p2.id, t: t2.id, amt: 2200000n, overdueIdx: -1 },
    { p: p3.id, t: t3.id, amt: 4800000n, overdueIdx: -1 },
    { p: p6.id, t: t4.id, amt: 2800000n, overdueIdx: 7 },
  ];
  for (const pair of pairs) {
    for (let i = 0; i < 12; i++) {
      const due  = new Date(2024, i, 1);
      const past = due <= new Date();
      const overdue = i === pair.overdueIdx;
      await prisma.payment.create({ data: { propertyId: pair.p, tenantId: pair.t, amount: pair.amt, type: "RENT", dueDate: due, paidDate: past && !overdue ? new Date(due.getTime() + 3 * 86400000) : null, status: past ? (overdue ? "OVERDUE" : "PAID") : "PENDING" } });
    }
  }

  // ── Bookings ─────────────────────────────────────────────────────────────────
  const guests = ["Obiageli Nwosu","Alex Mensah","Fatima Hassan","James Okonkwo","Sarah Adeleke","Kelechi Nnaji"];
  const refs   = ["WIL-8X2K9","WIL-3M7P4","WIL-9Q1R6","WIL-5T4N2","WIL-7H8V1","WIL-2C6M3"];
  for (let i = 0; i < 6; i++) {
    const ci = new Date(2024, 11 - Math.floor(i / 2), 5 + i * 4);
    const n  = 2 + (i % 4);
    const co = new Date(ci.getTime() + n * 86400000);
    const propId  = i < 3 ? p4.id : p8.id;
    const nightly = i < 3 ? 85000 : 180000;
    const status  = i < 2 ? "CONFIRMED" : i < 4 ? "COMPLETED" : "PENDING";
    await prisma.booking.create({ data: { propertyId: propId, guestName: guests[i], guestEmail: `${guests[i].toLowerCase().replace(/ /g, ".")}@mail.com`, checkin: ci, checkout: co, nights: n, totalPrice: BigInt(nightly * n), reference: refs[i], status } });
  }

  // ── Improvements ─────────────────────────────────────────────────────────────
  await prisma.improvement.createMany({ data: [
    { propertyId: p1.id, type: "Smart Home Upgrade",    cost: 4500000n,  valueImpact: 12000000n, status: "COMPLETE"    },
    { propertyId: p1.id, type: "Solar Installation",    cost: 3200000n,  valueImpact: 8000000n,  status: "APPROVED"    },
    { propertyId: p2.id, type: "Interior Renovation",   cost: 6000000n,  valueImpact: 18000000n, status: "IN_PROGRESS" },
    { propertyId: p3.id, type: "Tennis Court Addition", cost: 12000000n, valueImpact: 35000000n, status: "RECOMMENDED" },
    { propertyId: p6.id, type: "Security Upgrade",      cost: 1500000n,  valueImpact: 4000000n,  status: "RECOMMENDED" },
  ]});

  // ── Valuations ───────────────────────────────────────────────────────────────
  await prisma.valuation.createMany({ data: [
    { propertyId: p1.id, estimatedValue: 495000000n, confidence: 89, aiReport: "Strong buy signal. Ikoyi finishes and lagoon views command a sustained 15-20% premium." },
    { propertyId: p2.id, estimatedValue: 285000000n, confidence: 84, aiReport: "VI apartment values grew 12% YoY. Fully serviced status justifies pricing." },
    { propertyId: p5.id, estimatedValue: 228000000n, confidence: 81, aiReport: "Asokoro maintains strong diplomatic demand. 9.8% yield is 1.2pp above Abuja average." },
  ]});

  // ── Neighbourhoods ────────────────────────────────────────────────────────────
  await prisma.neighborhood.createMany({ data: [
    { name: "Ikoyi",           city: "Lagos",         avgPriceSqm: 1150000n, rentalYield: 8.5,  growthRate: 14.2, demandScore: 94, safetyIndex: 91, schoolRating: 88 },
    { name: "Victoria Island", city: "Lagos",         avgPriceSqm: 980000n,  rentalYield: 9.2,  growthRate: 11.8, demandScore: 92, safetyIndex: 88, schoolRating: 85 },
    { name: "Lekki Phase 1",   city: "Lagos",         avgPriceSqm: 720000n,  rentalYield: 10.4, growthRate: 16.7, demandScore: 89, safetyIndex: 84, schoolRating: 82 },
    { name: "Maitama",         city: "Abuja",         avgPriceSqm: 650000n,  rentalYield: 8.8,  growthRate: 9.5,  demandScore: 87, safetyIndex: 93, schoolRating: 90 },
    { name: "Asokoro",         city: "Abuja",         avgPriceSqm: 590000n,  rentalYield: 9.6,  growthRate: 8.2,  demandScore: 83, safetyIndex: 90, schoolRating: 87 },
    { name: "GRA Phase 2",     city: "Port Harcourt", avgPriceSqm: 420000n,  rentalYield: 11.2, growthRate: 7.8,  demandScore: 78, safetyIndex: 78, schoolRating: 80 },
  ]});

  // ── Projects + Units ─────────────────────────────────────────────────────────
  const proj1 = await prisma.project.create({ data: { companyId: co1.id, name: "Skyline Residences Phase 1", location: "Lekki Phase 1, Lagos", totalUnits: 48, soldUnits: 32, availableUnits: 10, reservedUnits: 6,  priceFrom: 85000000n,  priceTo: 240000000n, status: "SALES",        constructionPct: 72, launchDate: new Date("2023-06-01"), completionDate: new Date("2025-03-31") } });
  const proj2 = await prisma.project.create({ data: { companyId: co1.id, name: "Emerald Gardens Estate",     location: "Ibeju-Lekki, Lagos",   totalUnits: 48, soldUnits: 8,  availableUnits: 40, reservedUnits: 0,  priceFrom: 45000000n,  priceTo: 120000000n, status: "CONSTRUCTION", constructionPct: 18, launchDate: new Date("2024-09-01"), completionDate: new Date("2026-12-31") } });
  const proj3 = await prisma.project.create({ data: { companyId: co2.id, name: "Capitol Heights Abuja",      location: "Maitama, Abuja",       totalUnits: 48, soldUnits: 28, availableUnits: 15, reservedUnits: 5,  priceFrom: 95000000n,  priceTo: 280000000n, status: "SALES",        constructionPct: 91, launchDate: new Date("2023-01-15"), completionDate: new Date("2024-11-30") } });
  await prisma.project.create({ data: { companyId: co2.id, name: "Federal Links Court",         location: "Wuse 2, Abuja",        totalUnits: 48, soldUnits: 0,  availableUnits: 48, reservedUnits: 0,  priceFrom: 75000000n,  priceTo: 190000000n, status: "PLANNING",     constructionPct: 0,  launchDate: new Date("2025-03-01"), completionDate: new Date("2027-06-30") } });

  const types = ["Studio","1BR","2BR","3BR","4BR","Penthouse"];
  for (const proj of [proj1, proj3]) {
    const isSkyline = proj.id === proj1.id;
    for (let fl = 1; fl <= 8; fl++) {
      for (let u = 1; u <= 6; u++) {
        const idx  = (fl - 1) * 6 + (u - 1);
        const sold = isSkyline ? 32 : 28;
        const resv = isSkyline ? 38 : 33;
        const st   = idx < sold ? "SOLD" : idx < resv ? "RESERVED" : "AVAILABLE";
        const beds = u === 1 ? 0 : u === 6 ? 4 : u - 1;
        await prisma.unit.create({ data: { projectId: proj.id, unitNumber: `${fl}0${u}`, floor: fl, type: types[u - 1], bedrooms: beds, bathrooms: Math.max(1, beds), sqm: 55 + (u - 1) * 25, price: BigInt((isSkyline ? 85 : 95) * 1_000_000 + (fl - 1) * 10_000_000 + (u - 1) * 15_000_000), status: st } });
      }
    }
  }
  for (let fl = 1; fl <= 6; fl++) {
    for (let u = 1; u <= 8; u++) {
      const idx = (fl - 1) * 8 + (u - 1);
      await prisma.unit.create({ data: { projectId: proj2.id, unitNumber: `${fl}${String(u).padStart(2, "0")}`, floor: fl, type: ["1BR","2BR","3BR","4BR"][(u - 1) % 4], bedrooms: (u % 4) + 1, bathrooms: Math.max(1, u % 4), sqm: 70 + (u % 4) * 20, price: BigInt(45_000_000 + (u % 4) * 20_000_000 + fl * 5_000_000), status: idx < 8 ? "SOLD" : "AVAILABLE" } });
    }
  }

  console.log(`✓ 4 projects + units seeded`);

  // ── Leads (for agent) ─────────────────────────────────────────────────────────
  const leadData = [
    { name: "Babatunde Lawal",  email: "b.lawal@gmail.com",  phone: "+234 802 111 2222", status: "HOT",             message: "Looking for 4BR in Ikoyi, budget ₦280M",               source: "Website"    },
    { name: "Ifeoma Okafor",    email: "i.okafor@yahoo.com", phone: "+234 803 333 4444", status: "VIEWING_BOOKED",  message: "Interested in off-plan Skyline Phase 1, 2BR",           source: "Instagram"  },
    { name: "Emeka Dike",       email: "e.dike@hotmail.com", phone: "+234 805 555 6666", status: "OFFER_MADE",      message: "Ready to offer on Victoria Island penthouse",           source: "Referral"   },
    { name: "Adaeze Nwachukwu", email: "a.nw@gmail.com",     phone: "+234 806 777 8888", status: "NEW",             message: "Looking for rental in Ajah, 2-3 bedrooms max",          source: "Walk-in"    },
    { name: "Rotimi Adeleke",   email: "r.ade@gmail.com",    phone: "+234 807 999 0000", status: "WARM",            message: "First-time buyer, pre-approved ₦95M mortgage",          source: "PropertyPro"},
    { name: "Chinwe Obi",       email: "c.obi@gmail.com",    phone: "+234 808 123 4567", status: "CONTRACT_SIGNED", message: "Contracts signed for Banana Island property",           source: "WhatsApp"   },
    { name: "Sola Akinwande",   email: "s.ak@gmail.com",     phone: "+234 809 234 5678", status: "VIEWING_DONE",    message: "Viewed 3BR Lekki. Wants to revisit with spouse",        source: "Agent"      },
    { name: "Temi Fashola",     email: "t.fa@gmail.com",     phone: "+234 810 345 6789", status: "CLOSING",         message: "Final checks on Asokoro suite, ready to close",         source: "Twitter"    },
  ];
  for (const l of leadData) {
    await prisma.lead.create({ data: { ...l, agentId: agent.id, propertyId: p1.id } });
  }
  console.log(`✓ 8 leads seeded for agent`);

  // ── Investments ───────────────────────────────────────────────────────────────
  await prisma.investment.createMany({ data: [
    { investorId: investor.id, propertyId: p7.id, usdcAmount: 25000000000n, poolTokens: 25000n },
    { investorId: investor.id, propertyId: p8.id, usdcAmount: 10000000000n, poolTokens: 10000n },
    { investorId: investor.id, poolAddress: "0x1234567890abcdef1234567890abcdef12345678", usdcAmount: 50000000000n, poolTokens: 50000n },
  ]});
  console.log(`✓ Investments seeded`);

  // ── Leases ────────────────────────────────────────────────────────────────────
  // tenantId is a User FK — use buyer as demo tenant
  await prisma.lease.createMany({ data: [
    { propertyId: p1.id, landlordId: landlord.id, tenantId: buyer.id, monthlyRentUSDC: 2100000n, depositUSDC: 4200000n, durationMonths: 12, status: "ACTIVE",  startedAt: new Date("2024-01-15") },
    { propertyId: p2.id, landlordId: landlord.id, tenantId: buyer.id, monthlyRentUSDC: 1320000n, depositUSDC: 2640000n, durationMonths: 12, status: "PENDING" },
    { propertyId: p3.id, landlordId: landlord.id, tenantId: buyer.id, monthlyRentUSDC: 2880000n, depositUSDC: 5760000n, durationMonths: 12, status: "ACTIVE",  startedAt: new Date("2024-03-01") },
  ]});
  console.log(`✓ Leases seeded`);

  console.log(`
✅ Willow seed complete!

Demo accounts (all password: demo):
  landlord@willow.ng   — Landlord (8 properties, 4 tenants, 3 leases)
  investor@willow.ng   — Investor (3 investments)
  developer@willow.ng  — Developer (4 projects, 144 units)
  agent@willow.ng      — Agent (8 leads)
  buyer@willow.ng      — Buyer
  admin@willow.ng      — Admin
  `);
}

main().catch(console.error).finally(() => prisma.$disconnect());
