import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TRINFRA database seed (Zero-Budget Demo)...');

  // 1. Clean existing records
  await prisma.notification.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.document.deleteMany();
  await prisma.developerEnquiry.deleteMany();
  await prisma.landParcel.deleteMany();
  await prisma.project.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.landowner.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo Admin User
  const passwordHash = bcrypt.hashSync('TRINFRA-DEMO-2026', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trinfra.demo',
      passwordHash,
      fullName: 'Demo Administrator',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // 3. Seed Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      id: 'OPP-1',
      title: 'Kozhikode North',
      slug: 'kozhikode-north',
      location: 'Kozhikode, Kerala',
      district: 'Kozhikode',
      locality: 'Vadakara',
      area: 125,
      areaUnit: 'Acres',
      landownersCount: 18,
      status: 'IN_PROGRESS',
      image: '/images/houses_tropical.jpeg',
      shortDescription: 'Strategic location with strong development potential and excellent connectivity.',
      overview: 'Kozhikode North presents a significant opportunity for planned, sustainable development through a collaborative land-pooling model. The area benefits from strategic connectivity, proximity to key infrastructure, and strong growth potential. With 18 participating landowners and approximately 125 acres of consolidated land, this opportunity offers developers and investors a structured pathway to engage with a well-organized land pool.',
      highlights: JSON.stringify([
        'Strategic location with excellent connectivity',
        'Suitable for residential and commercial development',
        'Growing infrastructure in the region',
        'Collaborative land-pooling model',
        'Strong interest from developers and investors',
      ]),
      developmentPotential: 'Positioned for significant growth, with planned road expansions and proximity to transit corridors.',
      currentStatusDetail: 'Land aggregation is actively in progress with 18 participating landowners.',
      latitude: 11.35,
      longitude: 75.78,
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      id: 'OPP-2',
      title: 'Malappuram Growth Corridor',
      slug: 'malappuram-growth-corridor',
      location: 'Malappuram, Kerala',
      district: 'Malappuram',
      locality: 'Manjeri',
      area: 210,
      areaUnit: 'Acres',
      landownersCount: 26,
      status: 'IN_PROGRESS',
      image: '/images/rolling_hills.jpeg',
      shortDescription: 'Well-connected corridor with multi-sector development opportunities.',
      overview: 'The Malappuram Growth Corridor represents one of the largest consolidated land-pooling opportunities in the region. Spanning approximately 210 acres across 26 participating landowners, this corridor benefits from proximity to major transport links and a rapidly growing urban fringe.',
      highlights: JSON.stringify([
        'Large-scale consolidated opportunity',
        'Proximity to major transport links',
        'Multi-sector development potential',
      ]),
      developmentPotential: 'Ideal for integrated township development and regional logistics.',
      currentStatusDetail: 'Survey and documentation processes are actively underway.',
      latitude: 11.07,
      longitude: 76.07,
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      id: 'OPP-3',
      title: 'Palakkad West',
      slug: 'palakkad-west',
      location: 'Palakkad, Kerala',
      district: 'Palakkad',
      locality: 'Ottapalam',
      area: 86,
      areaUnit: 'Acres',
      landownersCount: 11,
      status: 'FORMING',
      image: '/images/agri_land.jpeg',
      shortDescription: 'Emerging cluster with high development and investment potential.',
      overview: 'Palakkad West is an emerging land-pooling opportunity in one of Kerala fastest-growing districts.',
      highlights: JSON.stringify([
        'Gateway location between Kerala and Tamil Nadu',
        'Growing IT and commercial presence',
      ]),
      developmentPotential: 'Residential and commercial projects targeting growing business corridors.',
      currentStatusDetail: 'Preliminary site assessments and owner coordination in progress.',
      latitude: 10.78,
      longitude: 76.58,
    },
  });

  const opp4 = await prisma.opportunity.create({
    data: {
      id: 'OPP-4',
      title: 'Thrissur East',
      slug: 'thrissur-east',
      location: 'Thrissur, Kerala',
      district: 'Thrissur',
      locality: 'Chalakudy',
      area: 160,
      areaUnit: 'Acres',
      landownersCount: 22,
      status: 'OPEN',
      image: '/images/farm_grid.jpeg',
      shortDescription: 'Close to industrial and residential hubs with strong infrastructure.',
      overview: 'Thrissur East offers a compelling land-pooling opportunity near one of Kerala most vibrant economic centers.',
      highlights: JSON.stringify([
        'Proximity to industrial and commercial zones',
        'Well-connected transport network',
      ]),
      developmentPotential: 'Mixed-use residential and commercial development.',
      currentStatusDetail: 'Initial stakeholder discussions underway.',
      latitude: 10.52,
      longitude: 76.28,
    },
  });
  console.log('✅ Opportunities seeded');

  // 4. Seed Projects
  await prisma.project.create({
    data: {
      id: 'PROJ-1',
      title: 'Riverside Development Project',
      slug: 'riverside-development-project',
      location: 'Kottayam, Kerala',
      district: 'Kottayam',
      approximateArea: 'Approx. 120 Acres',
      areaNum: 120,
      participatingLandowners: 22,
      status: 'IN_PROGRESS',
      developmentStage: 'DEVELOPMENT',
      progressPercentage: 65,
      image: '/images/hero_landscape.jpeg',
      description: 'A mixed-use development project with residential, commercial and community spaces, created through collaborative land pooling with multiple landowners.',
      overview: 'The Riverside Development Project in Kottayam stands as a premier example of collaborative land pooling. Positioned along key transit and riverfront corridors, this 120-acre contiguous land parcel unites 22 local landholders into a single integrated master plan.',
      tags: JSON.stringify(['In Progress', 'Mixed Use', 'Sustainable Development']),
      featured: true,
      opportunityId: opp1.id,
    },
  });

  await prisma.project.create({
    data: {
      id: 'PROJ-2',
      title: 'Greenfield Township',
      slug: 'greenfield-township',
      location: 'Thrissur, Kerala',
      district: 'Thrissur',
      approximateArea: 'Approx. 80 Acres',
      areaNum: 80,
      participatingLandowners: 16,
      status: 'PLANNING',
      developmentStage: 'PLANNING',
      progressPercentage: 35,
      image: '/images/farm_grid.jpeg',
      description: 'A planned residential township with modern amenities, internal arterial access, and expansive green spaces.',
      overview: 'Greenfield Township aggregates 80 acres of fertile and gently rolling terrain in Thrissur.',
      tags: JSON.stringify(['Residential', 'Township']),
      opportunityId: opp4.id,
    },
  });

  await prisma.project.create({
    data: {
      id: 'PROJ-3',
      title: 'Lakeside Living',
      slug: 'lakeside-living',
      location: 'Alappuzha, Kerala',
      district: 'Alappuzha',
      approximateArea: 'Approx. 65 Acres',
      areaNum: 65,
      participatingLandowners: 12,
      status: 'IN_PROGRESS',
      developmentStage: 'APPROVALS',
      progressPercentage: 55,
      image: '/images/rolling_hills.jpeg',
      description: 'A premium residential and recreational development near the backwaters with sustainable water management.',
      overview: 'Spanning 65 acres along the scenic backwater periphery of Alappuzha, Lakeside Living demonstrates how land pooling can harmonize premium residential architecture with sensitive wetland ecology.',
      tags: JSON.stringify(['Residential', 'Recreation']),
      opportunityId: opp2.id,
    },
  });

  await prisma.project.create({
    data: {
      id: 'PROJ-4',
      title: 'Tech Park Corridor',
      slug: 'tech-park-corridor',
      location: 'Ernakulam, Kerala',
      district: 'Ernakulam',
      approximateArea: 'Approx. 150 Acres',
      areaNum: 150,
      participatingLandowners: 28,
      status: 'DEVELOPMENT',
      developmentStage: 'DEVELOPMENT',
      progressPercentage: 80,
      image: '/images/digital_map.jpeg',
      description: 'An integrated business and technology park with excellent connectivity to metro transit and major expressways.',
      overview: 'Situated in the fast-expanding perimeter of Ernakulam, consolidating 150 acres across 28 individual parcels.',
      tags: JSON.stringify(['Commercial', 'IT / Business']),
      opportunityId: opp3.id,
    },
  });

  await prisma.project.create({
    data: {
      id: 'PROJ-5',
      title: 'Community Living',
      slug: 'community-living',
      location: 'Kozhikode, Kerala',
      district: 'Kozhikode',
      approximateArea: 'Approx. 45 Acres',
      areaNum: 45,
      participatingLandowners: 9,
      status: 'COMPLETED',
      developmentStage: 'COMPLETED',
      progressPercentage: 100,
      image: '/images/houses_tropical.jpeg',
      description: 'A completed residential community with modern infrastructure, community centres, and shared facilities.',
      overview: 'Completed in early 2026, Community Living brought 9 disparate landowners together to create a 45-acre harmonious residential enclave.',
      tags: JSON.stringify(['Residential', 'Completed']),
      opportunityId: opp1.id,
    },
  });
  console.log('✅ Projects seeded');

  // 5. Seed Landowners with Parcels & Admin Notes
  const lo1 = await prisma.landowner.create({
    data: {
      referenceNumber: 'TRI-2026-00001',
      ownerType: 'Individual',
      fullName: 'K. Narayanan Nair',
      email: 'narayanan.nair@example.com',
      phone: '+91 94471 23456',
      district: 'Kozhikode',
      localBody: 'Vadakara Municipality',
      locality: 'Vadakara North',
      approximateArea: 14.5,
      areaUnit: 'Acres',
      ownershipStatus: 'Sole Ownership',
      poolingInterest: 'Join Existing Pool',
      verificationStatus: 'VERIFIED',
      notes: 'Clear title deed with single owner. Contiguous with proposed Kozhikode cluster.',
      parcels: {
        create: [
          {
            surveyNumber: '342/1A',
            district: 'Kozhikode',
            localBody: 'Vadakara Municipality',
            locality: 'Vadakara North',
            approximateArea: 8.5,
            areaUnit: 'Acres',
            latitude: 11.605,
            longitude: 75.592,
            ownershipStatus: 'Sole Ownership',
            opportunityId: opp1.id,
          },
          {
            surveyNumber: '342/2B',
            district: 'Kozhikode',
            localBody: 'Vadakara Municipality',
            locality: 'Vadakara North',
            approximateArea: 6.0,
            areaUnit: 'Acres',
            latitude: 11.608,
            longitude: 75.595,
            ownershipStatus: 'Sole Ownership',
            opportunityId: opp1.id,
          },
        ],
      },
      adminNotes: {
        create: [
          {
            authorName: 'Adv. Suresh Babu',
            authorRole: 'Legal Advisor',
            content: 'Title deeds verified against sub-registrar records. 30-year encumbrance certificate is clean.',
          },
        ],
      },
    },
  });

  const lo2 = await prisma.landowner.create({
    data: {
      referenceNumber: 'TRI-2026-00002',
      ownerType: 'Family',
      fullName: 'Mathew Varghese & Family',
      email: 'mathew.varghese@example.com',
      phone: '+91 98460 34567',
      district: 'Kottayam',
      localBody: 'Kumarakom Grama Panchayat',
      locality: 'Attamangalam',
      approximateArea: 8.2,
      areaUnit: 'Acres',
      ownershipStatus: 'Family Inherited',
      poolingInterest: 'Initiate New Pool',
      verificationStatus: 'VERIFICATION_PENDING',
      notes: 'Inherited agricultural property with riverfront access.',
      parcels: {
        create: [
          {
            surveyNumber: '118/4',
            district: 'Kottayam',
            localBody: 'Kumarakom Grama Panchayat',
            locality: 'Attamangalam',
            approximateArea: 8.2,
            areaUnit: 'Acres',
            latitude: 9.612,
            longitude: 76.431,
            ownershipStatus: 'Family Inherited',
          },
        ],
      },
      adminNotes: {
        create: [
          {
            authorName: 'Ramesh K.',
            authorRole: 'Verification Officer',
            content: 'Heirship partition deed pending signature from one co-owner. Follow-up scheduled for next week.',
          },
        ],
      },
    },
  });

  const lo3 = await prisma.landowner.create({
    data: {
      referenceNumber: 'TRI-2026-00003',
      ownerType: 'Individual',
      fullName: 'Abdul Rasheed K.',
      email: 'abdul.rasheed@example.com',
      phone: '+91 97455 67890',
      district: 'Malappuram',
      localBody: 'Manjeri Municipality',
      locality: 'Kavanoor Road',
      approximateArea: 22.0,
      areaUnit: 'Acres',
      ownershipStatus: 'Joint Ownership',
      poolingInterest: 'Join Existing Pool',
      verificationStatus: 'NEW',
      notes: 'Submitted via portal. Interested in commercial-residential joint development.',
      parcels: {
        create: [
          {
            surveyNumber: '405/2',
            district: 'Malappuram',
            localBody: 'Manjeri Municipality',
            locality: 'Kavanoor Road',
            approximateArea: 22.0,
            areaUnit: 'Acres',
            latitude: 11.121,
            longitude: 76.115,
            ownershipStatus: 'Joint Ownership',
            opportunityId: opp2.id,
          },
        ],
      },
    },
  });

  const lo4 = await prisma.landowner.create({
    data: {
      referenceNumber: 'TRI-2026-00004',
      ownerType: 'Individual',
      fullName: 'Suma Sreedharan',
      email: 'suma.sreedharan@example.com',
      phone: '+91 94951 89012',
      district: 'Thrissur',
      localBody: 'Chalakudy Municipality',
      locality: 'East Chalakudy',
      approximateArea: 5.8,
      areaUnit: 'Acres',
      ownershipStatus: 'Sole Ownership',
      poolingInterest: 'Explore Options',
      verificationStatus: 'NEEDS_CLARIFICATION',
      notes: 'Need to clarify survey boundary overlap with adjacent irrigation canal.',
      parcels: {
        create: [
          {
            surveyNumber: '89/3C',
            district: 'Thrissur',
            localBody: 'Chalakudy Municipality',
            locality: 'East Chalakudy',
            approximateArea: 5.8,
            areaUnit: 'Acres',
            latitude: 10.31,
            longitude: 76.335,
            ownershipStatus: 'Sole Ownership',
            opportunityId: opp4.id,
          },
        ],
      },
    },
  });

  const lo5 = await prisma.landowner.create({
    data: {
      referenceNumber: 'TRI-2026-00005',
      ownerType: 'Group',
      fullName: 'Ernakulam Metro Agri Society',
      email: 'metro.agri@example.com',
      phone: '+91 98471 90123',
      district: 'Ernakulam',
      localBody: 'Aluva Municipality',
      locality: 'Kakkanad Ext',
      approximateArea: 35.0,
      areaUnit: 'Acres',
      ownershipStatus: 'Community',
      poolingInterest: 'Initiate New Pool',
      verificationStatus: 'VERIFIED',
      notes: 'Consortium of 5 neighboring landowners near Infopark highway.',
      parcels: {
        create: [
          {
            surveyNumber: '215/1',
            district: 'Ernakulam',
            localBody: 'Aluva Municipality',
            locality: 'Kakkanad Ext',
            approximateArea: 35.0,
            areaUnit: 'Acres',
            latitude: 10.015,
            longitude: 76.365,
            ownershipStatus: 'Community',
          },
        ],
      },
    },
  });
  console.log('✅ Landowners & parcels seeded');

  // 6. Seed Developer Enquiries
  await prisma.developerEnquiry.create({
    data: {
      referenceNumber: 'TRI-ENQ-2026-00001',
      fullName: 'Sanjay Menon',
      company: 'Sobha Developers Ltd',
      email: 'sanjay.menon@sobhadevelopers.example',
      phone: '+91 98950 11223',
      role: 'developer',
      interestType: 'explore_partnership',
      investmentRange: '₹50 Cr - ₹100 Cr',
      preferredLocation: 'Kozhikode, Ernakulam',
      message: 'Looking for contiguous land packages above 80 acres for mid-income residential township.',
      opportunityId: opp1.id,
      status: 'QUALIFIED',
      priority: 'HIGH',
      internalNotes: 'Top-tier developer. Initial financial discussion conducted.',
      adminNotes: {
        create: [
          {
            authorName: 'Rajesh Kumar',
            authorRole: 'Head of Partnerships',
            content: 'Presented Kozhikode North package. Interested in executing a preliminary MOU.',
          },
        ],
      },
    },
  });

  await prisma.developerEnquiry.create({
    data: {
      referenceNumber: 'TRI-ENQ-2026-00002',
      fullName: 'Priya Radhakrishnan',
      company: 'Apex Horizon Capital',
      email: 'priya.r@apexhorizon.example',
      phone: '+91 94460 44556',
      role: 'investor',
      interestType: 'request_info',
      investmentRange: '₹100 Cr+',
      preferredLocation: 'Kottayam, Alappuzha',
      message: 'Interested in sustainable eco-resort and riverfront hospitality opportunities.',
      status: 'CONTACTED',
      priority: 'HIGH',
      internalNotes: 'Requested detailed feasibility dossiers for Riverside Project.',
    },
  });

  await prisma.developerEnquiry.create({
    data: {
      referenceNumber: 'TRI-ENQ-2026-00003',
      fullName: 'Arun Kumar V.',
      company: 'Malabar Infrastructure LLP',
      email: 'arun@malabarinfra.example',
      phone: '+91 97450 77889',
      role: 'developer',
      interestType: 'schedule_discussion',
      investmentRange: '₹25 Cr - ₹50 Cr',
      preferredLocation: 'Malappuram, Thrissur',
      message: 'Evaluating logistics park and warehousing clusters in central Kerala.',
      status: 'NEW',
      priority: 'NORMAL',
    },
  });
  console.log('✅ Developer enquiries seeded');

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'registration_received',
        title: 'New Landowner Registration',
        message: 'Abdul Rasheed K. submitted 22.0 Acres in Manjeri, Malappuram.',
        reference: 'TRI-2026-00003',
        read: false,
      },
      {
        type: 'enquiry_received',
        title: 'New Developer Enquiry',
        message: 'Arun Kumar V. (Malabar Infrastructure) requested discussion on logistics land.',
        reference: 'TRI-ENQ-2026-00003',
        read: false,
      },
      {
        type: 'verification_updated',
        title: 'Landowner Verified',
        message: 'K. Narayanan Nair (TRI-2026-00001) title documentation approved by legal counsel.',
        reference: 'TRI-2026-00001',
        read: true,
      },
    ],
  });
  console.log('✅ Notifications seeded');

  console.log('✨ TRINFRA database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
