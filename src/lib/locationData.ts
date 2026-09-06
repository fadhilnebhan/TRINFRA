// Trinfra — Kerala Districts & Local Bodies
// Curated dataset for the registration form location step.

export interface LocalBody {
  name: string;
  type: 'municipality' | 'corporation' | 'panchayat';
}

export interface District {
  name: string;
  localBodies: LocalBody[];
}

export const KERALA_DISTRICTS: District[] = [
  {
    name: 'Thiruvananthapuram',
    localBodies: [
      { name: 'Thiruvananthapuram Corporation', type: 'corporation' },
      { name: 'Neyyattinkara Municipality', type: 'municipality' },
      { name: 'Attingal Municipality', type: 'municipality' },
      { name: 'Varkala Municipality', type: 'municipality' },
      { name: 'Nedumangad Municipality', type: 'municipality' },
      { name: 'Kazhakkoottam Panchayat', type: 'panchayat' },
      { name: 'Venjaramoodu Panchayat', type: 'panchayat' },
    ],
  },
  {
    name: 'Kollam',
    localBodies: [
      { name: 'Kollam Corporation', type: 'corporation' },
      { name: 'Karunagappally Municipality', type: 'municipality' },
      { name: 'Punalur Municipality', type: 'municipality' },
      { name: 'Kottarakkara Municipality', type: 'municipality' },
      { name: 'Paravur Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Pathanamthitta',
    localBodies: [
      { name: 'Pathanamthitta Municipality', type: 'municipality' },
      { name: 'Adoor Municipality', type: 'municipality' },
      { name: 'Thiruvalla Municipality', type: 'municipality' },
      { name: 'Pandalam Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Alappuzha',
    localBodies: [
      { name: 'Alappuzha Municipality', type: 'municipality' },
      { name: 'Cherthala Municipality', type: 'municipality' },
      { name: 'Kayamkulam Municipality', type: 'municipality' },
      { name: 'Haripad Municipality', type: 'municipality' },
      { name: 'Mavelikkara Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Kottayam',
    localBodies: [
      { name: 'Kottayam Municipality', type: 'municipality' },
      { name: 'Pala Municipality', type: 'municipality' },
      { name: 'Changanassery Municipality', type: 'municipality' },
      { name: 'Ettumanoor Municipality', type: 'municipality' },
      { name: 'Vaikom Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Idukki',
    localBodies: [
      { name: 'Thodupuzha Municipality', type: 'municipality' },
      { name: 'Adimali Municipality', type: 'municipality' },
      { name: 'Kattappana Municipality', type: 'municipality' },
      { name: 'Nedumkandam Panchayat', type: 'panchayat' },
    ],
  },
  {
    name: 'Ernakulam',
    localBodies: [
      { name: 'Kochi Corporation', type: 'corporation' },
      { name: 'Thrippunithura Municipality', type: 'municipality' },
      { name: 'Aluva Municipality', type: 'municipality' },
      { name: 'Perumbavoor Municipality', type: 'municipality' },
      { name: 'Angamaly Municipality', type: 'municipality' },
      { name: 'North Paravur Municipality', type: 'municipality' },
      { name: 'Kothamangalam Municipality', type: 'municipality' },
      { name: 'Muvattupuzha Municipality', type: 'municipality' },
      { name: 'Kalamassery Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Thrissur',
    localBodies: [
      { name: 'Thrissur Corporation', type: 'corporation' },
      { name: 'Chalakudy Municipality', type: 'municipality' },
      { name: 'Kunnamkulam Municipality', type: 'municipality' },
      { name: 'Kodungallur Municipality', type: 'municipality' },
      { name: 'Irinjalakuda Municipality', type: 'municipality' },
      { name: 'Guruvayur Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Palakkad',
    localBodies: [
      { name: 'Palakkad Municipality', type: 'municipality' },
      { name: 'Shornur Municipality', type: 'municipality' },
      { name: 'Ottapalam Municipality', type: 'municipality' },
      { name: 'Mannarkkad Municipality', type: 'municipality' },
      { name: 'Cherpulassery Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Malappuram',
    localBodies: [
      { name: 'Malappuram Municipality', type: 'municipality' },
      { name: 'Manjeri Municipality', type: 'municipality' },
      { name: 'Perinthalmanna Municipality', type: 'municipality' },
      { name: 'Ponnani Municipality', type: 'municipality' },
      { name: 'Tirur Municipality', type: 'municipality' },
      { name: 'Tanur Municipality', type: 'municipality' },
      { name: 'Kondotty Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Kozhikode',
    localBodies: [
      { name: 'Kozhikode Corporation', type: 'corporation' },
      { name: 'Vadakara Municipality', type: 'municipality' },
      { name: 'Koyilandy Municipality', type: 'municipality' },
      { name: 'Mukkom Municipality', type: 'municipality' },
      { name: 'Feroke Municipality', type: 'municipality' },
      { name: 'Ramanattukara Municipality', type: 'municipality' },
      { name: 'Koduvally Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Wayanad',
    localBodies: [
      { name: 'Kalpetta Municipality', type: 'municipality' },
      { name: 'Mananthavady Municipality', type: 'municipality' },
      { name: 'Sulthan Bathery Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Kannur',
    localBodies: [
      { name: 'Kannur Corporation', type: 'corporation' },
      { name: 'Thalassery Municipality', type: 'municipality' },
      { name: 'Taliparamba Municipality', type: 'municipality' },
      { name: 'Payyannur Municipality', type: 'municipality' },
      { name: 'Kuthuparamba Municipality', type: 'municipality' },
      { name: 'Mattannur Municipality', type: 'municipality' },
    ],
  },
  {
    name: 'Kasaragod',
    localBodies: [
      { name: 'Kasaragod Municipality', type: 'municipality' },
      { name: 'Kanhangad Municipality', type: 'municipality' },
      { name: 'Nileshwar Municipality', type: 'municipality' },
    ],
  },
];

/**
 * Get all district names.
 */
export function getDistrictNames(): string[] {
  return KERALA_DISTRICTS.map(d => d.name);
}

/**
 * Get local bodies for a given district.
 */
export function getLocalBodies(districtName: string): LocalBody[] {
  const district = KERALA_DISTRICTS.find(d => d.name === districtName);
  return district ? district.localBodies : [];
}
