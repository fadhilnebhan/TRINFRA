import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
  console.log('--- SEEDING RESIDENTIAL DATA ---');

  // 1. Ensure Demo Seller Account exists
  const sellerEmail = 'seller@trinfra.demo';
  let seller = await prisma.user.findUnique({
    where: { email: sellerEmail },
  });

  if (!seller) {
    seller = await prisma.user.create({
      data: {
        fullName: 'Mathew Thomas',
        email: sellerEmail,
        phone: '+91 98470 12345',
        companyName: 'Skyline Skyline Properties Kerala',
        passwordHash: hashPassword('TRINFRA-SELLER-2026'),
        role: 'SELLER',
      },
    });
    console.log('✅ Created Demo Seller:', seller.email);
  } else {
    console.log('ℹ️ Demo Seller already exists:', seller.email);
  }

  // Check if we already have residential listings
  const existingCount = await prisma.residentialListing.count();
  if (existingCount > 0) {
    console.log(`ℹ️ Found ${existingCount} existing residential listings. Skipping seed.`);
    return;
  }

  // 2. Initial Published Listings in Ernakulam, Thiruvananthapuram, Kozhikode, Thrissur, Kottayam
  // Note: Wayanad, Idukki, Kasaragod, Pathanamthitta, Alappuzha, Palakkad, Malappuram, Kannur, Kollam start at 0
  const initialListings = [
    {
      sellerId: seller.id,
      title: 'Waterfront 3 BHK Luxury Apartment at Marine Drive',
      slug: 'waterfront-3-bhk-luxury-apartment-marine-drive-ernakulam',
      propertyType: 'Apartment',
      listingPurpose: 'Sale',
      description: 'Ultra-luxury high-rise 3 BHK residence overlooking the Cochin backwaters. Features Italian marble flooring, designer modular kitchen, VRV air-conditioning, infinity swimming pool, and private marina access.',
      district: 'Ernakulam',
      locality: 'Marine Drive, Kochi',
      address: 'Skyline Gateway, Marine Drive Walkway',
      pincode: '682031',
      latitude: 9.9816,
      longitude: 76.2753,
      area: 2450,
      areaUnit: 'sq ft',
      bedrooms: 3,
      bathrooms: 3,
      floor: 14,
      totalFloors: 24,
      furnishedStatus: 'Fully Furnished',
      parking: '2 Covered',
      balcony: 2,
      propertyAge: 'Ready to Move',
      facing: 'West',
      price: 24500000,
      priceType: 'Total',
      negotiable: true,
      amenities: ['Swimming Pool', 'Clubhouse', 'Gym', '24/7 Security', 'Power Backup', 'Covered Parking', 'Sea View'],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3 * 86400000),
      images: [
        {
          storageKey: 'ern_marine_1',
          url: '/images/houses_tropical.jpeg',
          filename: 'marine_drive_view.jpg',
          mimeType: 'image/jpeg',
          size: 420000,
          sortOrder: 0,
          isCover: true,
        },
        {
          storageKey: 'ern_marine_2',
          url: '/images/land_commercial.jpeg',
          filename: 'living_hall.jpg',
          mimeType: 'image/jpeg',
          size: 380000,
          sortOrder: 1,
          isCover: false,
        },
      ],
    },
    {
      sellerId: seller.id,
      title: 'Modern 2 BHK Urban Flat near Kakkanad InfoPark',
      slug: 'modern-2-bhk-urban-flat-kakkanad-infopark-ernakulam',
      propertyType: 'Flat',
      listingPurpose: 'Sale',
      description: 'Contemporary tech-corridor apartment perfect for IT professionals and growing families. Located 5 minutes from SmartCity and InfoPark Phase 2.',
      district: 'Ernakulam',
      locality: 'Kakkanad',
      address: 'Green Meadows, InfoPark Expressway',
      pincode: '682042',
      latitude: 10.0159,
      longitude: 76.3419,
      area: 1250,
      areaUnit: 'sq ft',
      bedrooms: 2,
      bathrooms: 2,
      floor: 6,
      totalFloors: 12,
      furnishedStatus: 'Semi-Furnished',
      parking: '1 Covered',
      balcony: 1,
      propertyAge: '0-1 years',
      facing: 'East',
      price: 6800000,
      priceType: 'Total',
      negotiable: true,
      amenities: ['Gym', 'Children Play Area', '24/7 Security', 'Power Backup', 'EV Charging'],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 2 * 86400000),
      images: [
        {
          storageKey: 'ern_kakkanad_1',
          url: '/images/houses_tropical.jpeg',
          filename: 'kakkanad_front.jpg',
          mimeType: 'image/jpeg',
          size: 350000,
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
    {
      sellerId: seller.id,
      title: 'Regal 4 BHK Heritage Villa near Kowdiar Palace',
      slug: 'regal-4-bhk-heritage-villa-kowdiar-palace-thiruvananthapuram',
      propertyType: 'Villa',
      listingPurpose: 'Sale',
      description: 'Stately independent villa in Trivandrum’s most prestigious royal enclave. Traditional Kerala architecture blended with modern amenities, manicured garden, and teak wood woodwork.',
      district: 'Thiruvananthapuram',
      locality: 'Kowdiar',
      address: 'Palace View Avenue, Kowdiar',
      pincode: '695003',
      latitude: 8.5241,
      longitude: 76.9558,
      area: 3600,
      areaUnit: 'sq ft',
      bedrooms: 4,
      bathrooms: 5,
      floor: 1,
      totalFloors: 2,
      furnishedStatus: 'Fully Furnished',
      parking: '2 Covered',
      balcony: 3,
      propertyAge: '1-5 years',
      facing: 'East',
      price: 38500000,
      priceType: 'Total',
      negotiable: false,
      amenities: ['Private Garden', 'Security System', 'Solar Power', 'Home Theatre', 'Servant Quarters'],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 5 * 86400000),
      images: [
        {
          storageKey: 'tvm_kowdiar_1',
          url: '/images/houses_tropical.jpeg',
          filename: 'kowdiar_exterior.jpg',
          mimeType: 'image/jpeg',
          size: 510000,
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
    {
      sellerId: seller.id,
      title: 'Premium 3 BHK Beachside Flat at Kozhikode Beach',
      slug: 'premium-3-bhk-beachside-flat-kozhikode-beach-kozhikode',
      propertyType: 'Flat',
      listingPurpose: 'Rent',
      description: 'Panoramic Arabian Sea sunset view flat on Beach Road. Walking distance to waterfront promenade, top restaurants, and railway station.',
      district: 'Kozhikode',
      locality: 'Beach Road, Calicut',
      address: 'Ocean Crest Residences, Beach Road',
      pincode: '673032',
      latitude: 11.2588,
      longitude: 75.7804,
      area: 1850,
      areaUnit: 'sq ft',
      bedrooms: 3,
      bathrooms: 3,
      floor: 8,
      totalFloors: 16,
      furnishedStatus: 'Fully Furnished',
      parking: '1 Covered',
      balcony: 2,
      propertyAge: 'Ready to Move',
      facing: 'West',
      price: 45000,
      priceType: 'Per Month',
      negotiable: true,
      amenities: ['Sea View', 'Gym', '24/7 Security', 'Lobby Lounge', 'Intercom'],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1 * 86400000),
      images: [
        {
          storageKey: 'clt_beach_1',
          url: '/images/houses_tropical.jpeg',
          filename: 'calicut_beach_apt.jpg',
          mimeType: 'image/jpeg',
          size: 440000,
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
    {
      sellerId: seller.id,
      title: 'Spacious 3 BHK Family Apartment near Swaraj Round',
      slug: 'spacious-3-bhk-family-apartment-swaraj-round-thrissur',
      propertyType: 'Apartment',
      listingPurpose: 'Sale',
      description: 'Centrally located luxury apartment in the cultural capital. High ceiling design, cross-ventilation, close to major temples, cultural centres, and reputed schools.',
      district: 'Thrissur',
      locality: 'Swaraj Round North',
      address: 'Temple Bells Enclave, Palace Road',
      pincode: '680020',
      latitude: 10.5276,
      longitude: 76.2144,
      area: 1750,
      areaUnit: 'sq ft',
      bedrooms: 3,
      bathrooms: 3,
      floor: 4,
      totalFloors: 10,
      furnishedStatus: 'Semi-Furnished',
      parking: '1 Covered',
      balcony: 1,
      propertyAge: '0-1 years',
      facing: 'North',
      price: 9200000,
      priceType: 'Total',
      negotiable: true,
      amenities: ['Community Hall', 'Gym', 'Kids Play Area', 'Power Backup'],
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 4 * 86400000),
      images: [
        {
          storageKey: 'tsr_round_1',
          url: '/images/houses_tropical.jpeg',
          filename: 'thrissur_apt.jpg',
          mimeType: 'image/jpeg',
          size: 390000,
          sortOrder: 0,
          isCover: true,
        },
      ],
    },
  ];

  for (const item of initialListings) {
    const { images, ...listingData } = item;
    await prisma.residentialListing.create({
      data: {
        ...listingData,
        images: {
          create: images,
        },
      },
    });
    console.log(`✅ Seeded: [${item.district}] ${item.title}`);
  }

  console.log('✨ RESIDENTIAL SEED COMPLETED SUCCESSFULLY.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
