import { PrismaClient, UserRole, ListingType, TenantStatus, PaymentStatus, PaymentType, BookingStatus, LeadStatus, ProjectStatus, UnitStatus, ImprovementStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.improvement.deleteMany();
  await prisma.valuation.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const pw = await bcrypt.hash("demo", 10);

  const landlord = await prisma.user.create({ data: { name: "Adaeze Okafor",  email: "landlord@willow.ng",  password: pw, role: UserRole.LANDLORD,  phone: "+234 801 234 5678" } });
  const investor = await prisma.user.create({ data: { name: "Emeka Nwosu",    email: "investor@willow.ng",  password: pw, role: UserRole.INVESTOR,  phone: "+234 802 345 6789" } });
  const developer = await prisma.user.create({ data: { name: "Tunde Adeleke", email: "developer@willow.ng", password: pw, role: UserRole.DEVELOPER, phone: "+234 803 456 7890" } });

  const co1 = await prisma.company.create({ data: { ownerId: developer.id, name: "Adeleke Homes & Properties", type: "DEVELOPER", city: "Lagos",  totalUnits: 96 } });
  const co2 = await prisma.company.create({ data: { ownerId: developer.id, name: "Apex Real Estate Development", type: "DEVELOPER", city: "Abuja", totalUnits: 96 } });

  const p1 = await prisma.property.create({ data: { ownerId: landlord.id,  title: "Panorama Heights Penthouse",      location: "15 Bourdillon Road, Ikoyi",            city: "Lagos",         state: "Lagos State",  propertyType: "PENTHOUSE",       bedrooms: 4, bathrooms: 4, sqm: 420,  currentValue: 480000000n, listingType: ListingType.RENT,     price: 3500000n, roiPercent: 8.75, uosScore: 87, yearBuilt: 2022, features: ["Pool","Smart Home","Gym","Concierge","Generator","CCTV"] } });
  const p2 = await prisma.property.create({ data: { ownerId: landlord.id,  title: "Victoria Crown Luxury Apt",       location: "Plot 45, Ozumba Mbadiwe, VI",          city: "Lagos",         state: "Lagos State",  propertyType: "APARTMENT",       bedrooms: 3, bathrooms: 3, sqm: 185,  currentValue: 280000000n, listingType: ListingType.RENT,     price: 2200000n, roiPercent: 9.43, uosScore: 76, yearBuilt: 2020, features: ["AC","Generator","Security","Parking","Elevator"] } });
  const p3 = await prisma.property.create({ data: { ownerId: landlord.id,  title: "Maitama Executive Villa",         location: "12 Niger Crescent, Maitama",           city: "Abuja",         state: "FCT",          propertyType: "VILLA",           bedrooms: 5, bathrooms: 5, sqm: 650,  currentValue: 650000000n, listingType: ListingType.RENT,     price: 4800000n, roiPercent: 8.86, uosScore: 92, yearBuilt: 2019, features: ["Pool","Guest Chalet","Solar","Cinema","Tennis Court"] } });
  const p4 = await prisma.property.create({ data: { ownerId: investor.id,  title: "Lekki Phase 1 Shortlet Block",    location: "23 Admiralty Way, Lekki Phase 1",      city: "Lagos",         state: "Lagos State",  propertyType: "APARTMENT",       bedrooms: 2, bathrooms: 2, sqm: 120,  currentValue: 185000000n, listingType: ListingType.SHORTLET, price: 85000n,   roiPercent: 16.7, uosScore: 68, yearBuilt: 2018, features: ["AC","WiFi","Generator","Security"] } });
  const p5 = await prisma.property.create({ data: { ownerId: investor.id,  title: "Asokoro Heights Premium Suite",   location: "8 Aso Drive, Asokoro",                 city: "Abuja",         state: "FCT",          propertyType: "APARTMENT",       bedrooms: 2, bathrooms: 2, sqm: 145,  currentValue: 220000000n, listingType: ListingType.RENT,     price: 1800000n, roiPercent: 9.82, uosScore: 79, yearBuilt: 2021, features: ["AC","Generator","CCTV","Gym","Concierge"] } });
  const p6 = await prisma.property.create({ data: { ownerId: landlord.id,  title: "GRA Port Harcourt Duplex",        location: "15 Tombia Street, GRA Phase 2",        city: "Port Harcourt", state: "Rivers State", propertyType: "DUPLEX",          bedrooms: 4, bathrooms: 3, sqm: 280,  currentValue: 320000000n, listingType: ListingType.RENT,     price: 2800000n, roiPercent: 10.5, uosScore: 71, yearBuilt: 2016, features: ["Security","Generator","BQ","Garden"] } });
  const p7 = await prisma.property.create({ data: { ownerId: investor.id,  title: "Wuse 2 Commercial Property",      location: "Plot 1234, Aminu Kano Crescent",       city: "Abuja",         state: "FCT",          propertyType: "COMMERCIAL",      bedrooms: 0, bathrooms: 4, sqm: 850,  currentValue: 980000000n, listingType: ListingType.BUY,      price: 980000000n, roiPercent: 12.4, uosScore: 83, yearBuilt: 2015, features: ["Elevator","Generator","50-car Park","CCTV"] } });
  const p8 = await prisma.property.create({ data: { ownerId: investor.id,  title: "Oniru Waterfront Townhouse",      location: "10 Kofo Abayomi St, VI Extension",     city: "Lagos",         state: "Lagos State",  propertyType: "TOWNHOUSE",       bedrooms: 4, bathrooms: 4, sqm: 380,  currentValue: 750000000n, listingType: ListingType.SHORTLET, price: 180000n,  roiPercent: 14.2, uosScore: 90, yearBuilt: 2023, features: ["Waterfront","Private Jetty","Pool","Smart Home","Cinema"] } });

  const t1 = await prisma.tenant.create({ data: { propertyId: p1.id, landlordId: landlord.id, name: "Chidi Okeke",              email: "chidi@techcorp.ng",    phone: "+234 812 345 6789", rentAmount: 3500000n, leaseStart: new Date("2024-01-15"), leaseEnd: new Date("2025-01-14"), status: TenantStatus.ACTIVE  } });
  const t2 = await prisma.tenant.create({ data: { propertyId: p2.id, landlordId: landlord.id, name: "Ngozi Eze",               email: "ngozi@firstbank.ng",   phone: "+234 813 456 7890", rentAmount: 2200000n, leaseStart: new Date("2023-10-01"), leaseEnd: new Date("2024-09-30"), status: TenantStatus.NOTICE  } });
  const t3 = await prisma.tenant.create({ data: { propertyId: p3.id, landlordId: landlord.id, name: "Ambassador J. Harrington", email: "jh@ukembassy.gov",     phone: "+234 814 567 8901", rentAmount: 4800000n, leaseStart: new Date("2024-03-01"), leaseEnd: new Date("2025-02-28"), status: TenantStatus.ACTIVE  } });
  const t4 = await prisma.tenant.create({ data: { propertyId: p6.id, landlordId: landlord.id, name: "Dr. Ibifuro Princewill",  email: "dr.p@hospmedical.ng",  phone: "+234 815 678 9012", rentAmount: 2800000n, leaseStart: new Date("2023-07-01"), leaseEnd: new Date("2024-06-30"), status: TenantStatus.EXPIRED } });
  const t5 = await prisma.tenant.create({ data: { propertyId: p5.id, landlordId: investor.id, name: "Fatima Al-Hassan",        email: "fatima@govt.ng",       phone: "+234 816 789 0123", rentAmount: 1800000n, leaseStart: new Date("2024-04-01"), leaseEnd: new Date("2025-03-31"), status: TenantStatus.ACTIVE  } });

  const tenantPairs = [
    { p: p1.id, t: t1.id, amt: 3500000n, miss: 9 },
    { p: p2.id, t: t2.id, amt: 2200000n, miss: -1 },
    { p: p3.id, t: t3.id, amt: 4800000n, miss: -1 },
    { p: p6.id, t: t4.id, amt: 2800000n, miss: 7 },
  ];
  for (const pair of tenantPairs) {
    for (let i = 0; i < 12; i++) {
      const due = new Date(2024, i, 1);
      const past = due <= new Date();
      const overdue = i === pair.miss;
      await prisma.payment.create({
        data: {
          propertyId: pair.p, tenantId: pair.t, amount: pair.amt,
          type: PaymentType.RENT, dueDate: due,
          paidDate: past && !overdue ? new Date(due.getTime() + 3 * 86400000) : null,
          status: past ? (overdue ? PaymentStatus.OVERDUE : PaymentStatus.PAID) : PaymentStatus.PENDING,
        }
      });
    }
  }

  const guests = ["Obiageli Nwosu","Alex Mensah","Fatima Al-Hassan","James Okonkwo","Sarah Adeleke","Kelechi Nnaji"];
  const refs   = ["WIL-8X2K9","WIL-3M7P4","WIL-9Q1R6","WIL-5T4N2","WIL-7H8V1","WIL-2C6M3"];
  for (let i = 0; i < 6; i++) {
    const ci = new Date(2024, 11 - Math.floor(i / 2), 5 + i * 4);
    const n  = 2 + (i % 4);
    const co = new Date(ci.getTime() + n * 86400000);
    const propId = i < 3 ? p4.id : p8.id;
    const nightly = i < 3 ? 85000 : 180000;
    await prisma.booking.create({ data: { propertyId: propId, guestName: guests[i], guestEmail: `${guests[i].toLowerCase().replace(/ /g,".")}@mail.com`, checkin: ci, checkout: co, nights: n, totalPrice: BigInt(nightly * n), reference: refs[i], status: i < 2 ? BookingStatus.CONFIRMED : i < 4 ? BookingStatus.COMPLETED : BookingStatus.PENDING } });
  }

  await prisma.improvement.createMany({ data: [
    { propertyId: p1.id, type: "Smart Home Upgrade",    cost: 4500000n,  valueImpact: 12000000n, status: ImprovementStatus.COMPLETE    },
    { propertyId: p1.id, type: "Solar Installation",    cost: 3200000n,  valueImpact: 8000000n,  status: ImprovementStatus.APPROVED    },
    { propertyId: p2.id, type: "Interior Renovation",   cost: 6000000n,  valueImpact: 18000000n, status: ImprovementStatus.IN_PROGRESS },
    { propertyId: p3.id, type: "Tennis Court Addition", cost: 12000000n, valueImpact: 35000000n, status: ImprovementStatus.RECOMMENDED },
    { propertyId: p6.id, type: "Security Upgrade",      cost: 1500000n,  valueImpact: 4000000n,  status: ImprovementStatus.RECOMMENDED },
  ]});

  await prisma.valuation.createMany({ data: [
    { propertyId: p1.id, estimatedValue: 495000000n, confidence: 89, aiReport: "Strong buy signal. Ikoyi premium finishes and lagoon views command a sustained 15-20% premium." },
    { propertyId: p2.id, estimatedValue: 285000000n, confidence: 84, aiReport: "VI apartment values grew 12% YoY. Fully serviced status and Ozumba Mbadiwe proximity justify pricing." },
    { propertyId: p5.id, estimatedValue: 228000000n, confidence: 81, aiReport: "Asokoro maintains strong diplomatic demand. 9.8% yield is 1.2pp above Abuja average." },
  ]});

  await prisma.neighborhood.createMany({ data: [
    { name: "Ikoyi",           city: "Lagos",         avgPriceSqm: 1150000n, rentalYield: 8.5,  growthRate: 14.2, demandScore: 94, safetyIndex: 91, schoolRating: 88 },
    { name: "Victoria Island", city: "Lagos",         avgPriceSqm: 980000n,  rentalYield: 9.2,  growthRate: 11.8, demandScore: 92, safetyIndex: 88, schoolRating: 85 },
    { name: "Lekki Phase 1",   city: "Lagos",         avgPriceSqm: 720000n,  rentalYield: 10.4, growthRate: 16.7, demandScore: 89, safetyIndex: 84, schoolRating: 82 },
    { name: "Maitama",         city: "Abuja",         avgPriceSqm: 650000n,  rentalYield: 8.8,  growthRate: 9.5,  demandScore: 87, safetyIndex: 93, schoolRating: 90 },
    { name: "Asokoro",         city: "Abuja",         avgPriceSqm: 590000n,  rentalYield: 9.6,  growthRate: 8.2,  demandScore: 83, safetyIndex: 90, schoolRating: 87 },
    { name: "GRA Phase 2",     city: "Port Harcourt", avgPriceSqm: 420000n,  rentalYield: 11.2, growthRate: 7.8,  demandScore: 78, safetyIndex: 78, schoolRating: 80 },
  ]});

  const proj1 = await prisma.project.create({ data: { companyId: co1.id, name: "Skyline Residences Phase 1", location: "Lekki Phase 1, Lagos",  totalUnits: 48, soldUnits: 32, availableUnits: 10, reservedUnits: 6,  priceFrom: 85000000n,  priceTo: 240000000n, status: ProjectStatus.SALES,        constructionPct: 72, launchDate: new Date("2023-06-01"), completionDate: new Date("2025-03-31") } });
  const proj2 = await prisma.project.create({ data: { companyId: co1.id, name: "Emerald Gardens Estate",     location: "Ibeju-Lekki, Lagos",    totalUnits: 48, soldUnits: 8,  availableUnits: 40, reservedUnits: 0,  priceFrom: 45000000n,  priceTo: 120000000n, status: ProjectStatus.CONSTRUCTION, constructionPct: 18, launchDate: new Date("2024-09-01"), completionDate: new Date("2026-12-31") } });
  const proj3 = await prisma.project.create({ data: { companyId: co2.id, name: "Capitol Heights Abuja",      location: "Maitama, Abuja",        totalUnits: 48, soldUnits: 28, availableUnits: 15, reservedUnits: 5,  priceFrom: 95000000n,  priceTo: 280000000n, status: ProjectStatus.SALES,        constructionPct: 91, launchDate: new Date("2023-01-15"), completionDate: new Date("2024-11-30") } });
  const proj4 = await prisma.project.create({ data: { companyId: co2.id, name: "Federal Links Court",         location: "Wuse 2, Abuja",         totalUnits: 48, soldUnits: 0,  availableUnits: 48, reservedUnits: 0,  priceFrom: 75000000n,  priceTo: 190000000n, status: ProjectStatus.PLANNING,     constructionPct: 0,  launchDate: new Date("2025-03-01"), completionDate: new Date("2027-06-30") } });

  const types = ["Studio","1BR","2BR","3BR","4BR","Penthouse"];
  for (const proj of [proj1, proj3]) {
    const isSkyline = proj.id === proj1.id;
    for (let fl = 1; fl <= 8; fl++) {
      for (let u = 1; u <= 6; u++) {
        const idx = (fl - 1) * 6 + (u - 1);
        const sold   = isSkyline ? 32 : 28;
        const resv   = isSkyline ? 38 : 33;
        const st = idx < sold ? UnitStatus.SOLD : idx < resv ? UnitStatus.RESERVED : UnitStatus.AVAILABLE;
        const beds = u === 1 ? 0 : u === 6 ? 4 : u - 1;
        await prisma.unit.create({ data: { projectId: proj.id, unitNumber: `${fl}0${u}`, floor: fl, type: types[u - 1], bedrooms: beds, bathrooms: Math.max(1, beds), sqm: 55 + (u - 1) * 25, price: BigInt((isSkyline ? 85 : 95) * 1000000 + (fl - 1) * 10000000 + (u - 1) * 15000000), status: st } });
      }
    }
  }
  for (let fl = 1; fl <= 6; fl++) {
    for (let u = 1; u <= 8; u++) {
      const idx = (fl - 1) * 8 + (u - 1);
      await prisma.unit.create({ data: { projectId: proj2.id, unitNumber: `${fl}${String(u).padStart(2,"0")}`, floor: fl, type: ["1BR","2BR","3BR","4BR"][(u - 1) % 4], bedrooms: (u % 4) + 1, bathrooms: Math.max(1, (u % 4)), sqm: 70 + (u % 4) * 20, price: BigInt(45000000 + (u % 4) * 20000000 + fl * 5000000), status: idx < 8 ? UnitStatus.SOLD : UnitStatus.AVAILABLE } });
    }
  }

  const leadNames = ["Chukwuemeka Obi","Folake Adeyemi","Ibrahim Musa","Chioma Nwachukwu","Ayo Bankole","Kemi Lawson","Bola Tinubu Jr","Amaka Okafor"];
  const lStatuses = [LeadStatus.HOT, LeadStatus.VIEWING_BOOKED, LeadStatus.OFFER_MADE, LeadStatus.NEW, LeadStatus.RESERVED, LeadStatus.CONTRACT_SIGNED, LeadStatus.WARM, LeadStatus.CLOSING];
  const sources   = ["Walk-in","Website","Instagram","Referral","PropertyPro","WhatsApp","Twitter","Agent"];
  for (let i = 0; i < 8; i++) {
    await prisma.lead.create({ data: { propertyId: p1.id, name: leadNames[i], email: `${leadNames[i].toLowerCase().replace(/ /g,".")}@mail.com`, phone: `+234 8${i}1 234 ${5000+i}`, message: `Interested in ${i%2===0?"2BR":"3BR"} unit. Budget ₦${85+i*20}M.`, status: lStatuses[i], source: sources[i] } });
  }

  console.log("✅ Willow seed complete");
  console.log("   landlord@willow.ng / demo");
  console.log("   investor@willow.ng / demo");
  console.log("   developer@willow.ng / demo");
}

main().catch(console.error).finally(() => prisma.$disconnect());
