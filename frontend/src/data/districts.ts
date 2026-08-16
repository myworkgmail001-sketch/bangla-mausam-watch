import { District } from '../types';

export const districts: District[] = [
  { slug: 'alipurduar', name: 'Alipurduar', namebn: 'আলিপুরদুয়ার', lat: 26.49, lng: 89.53, population: 1590000, area: 3383, headquarters: 'Alipurduar', headquartersbn: 'আলিপুরদুয়ার', rivers: ['Teesta', 'Jamuna'], coordinates: [[89.30, 26.60], [89.80, 26.60], [89.80, 26.40], [89.30, 26.40]] },
  { slug: 'bankura', name: 'Bankura', namebn: 'বাঁকুড়া', lat: 23.25, lng: 87.07, population: 3590000, area: 6882, headquarters: 'Bankura', headquartersbn: 'বাঁকুড়া', rivers: ['Damodar', 'Banksai'], coordinates: [[86.80, 23.40], [87.30, 23.40], [87.30, 23.10], [86.80, 23.10]] },
  { slug: 'birbhum', name: 'Birbhum', namebn: 'বীরভূম', lat: 23.87, lng: 87.37, population: 3500000, area: 4545, headquarters: 'Suri', headquartersbn: 'সিয়ুরি', rivers: ['Ajay', 'Mayurakshi'], coordinates: [[87.10, 24.10], [87.70, 24.10], [87.70, 23.70], [87.10, 23.70]] },
  { slug: 'burdwan', name: 'Burdwan', namebn: 'বর্ধমান', lat: 23.24, lng: 87.86, population: 7100000, area: 7024, headquarters: 'Bardhaman', headquartersbn: 'বর্ধমান', rivers: ['Damodar', 'Bhagirathi'], coordinates: [[87.50, 23.50], [88.20, 23.50], [88.20, 23.00], [87.50, 23.00]] },
  { slug: 'cooch-behar', name: 'Cooch Behar', namebn: 'কোচবিহার', lat: 26.33, lng: 89.45, population: 2820000, area: 3387, headquarters: 'Cooch Behar', headquartersbn: 'কোচবিহার', rivers: ['Teesta', 'Torsa'], coordinates: [[89.10, 26.50], [89.80, 26.50], [89.80, 26.10], [89.10, 26.10]] },
  { slug: 'darjeeling', name: 'Darjeeling', namebn: 'দার্জিলিং', lat: 27.04, lng: 88.26, population: 1850000, area: 3149, headquarters: 'Darjeeling', headquartersbn: 'দার্জিলিং', rivers: ['Teesta', 'Rangeet'], coordinates: [[87.90, 27.20], [88.70, 27.20], [88.70, 26.90], [87.90, 26.90]] },
  { slug: 'hooghly', name: 'Hooghly', namebn: 'হুগলি', lat: 22.91, lng: 88.39, population: 5100000, area: 3149, headquarters: 'Chinsura', headquartersbn: 'চিনসুরা', rivers: ['Hooghly', 'Damodar'], coordinates: [[88.20, 23.10], [88.60, 23.10], [88.60, 22.70], [88.20, 22.70]] },
  { slug: 'howrah', name: 'Howrah', namebn: 'হাওড়া', lat: 22.58, lng: 88.33, population: 4850000, area: 1467, headquarters: 'Howrah', headquartersbn: 'হাওড়া', rivers: ['Hooghly', 'Rupnarayan'], coordinates: [[88.10, 22.80], [88.50, 22.80], [88.50, 22.40], [88.10, 22.40]] },
  { slug: 'jalpaiguri', name: 'Jalpaiguri', namebn: 'জলপাইগুড়ি', lat: 26.55, lng: 88.72, population: 3910000, area: 6227, headquarters: 'Jalpaiguri', headquartersbn: 'জলপাইগুড়ি', rivers: ['Teesta', 'Jaldhaka'], coordinates: [[88.40, 26.80], [89.00, 26.80], [89.00, 26.30], [88.40, 26.30]] },
  { slug: 'jhargram', name: 'Jhargram', namebn: 'ঝাড়গ্রাম', lat: 22.45, lng: 86.99, population: 1140000, area: 3037, headquarters: 'Jhargram', headquartersbn: 'ঝাড়গ্রাম', rivers: ['Subarnarekha', 'Kangsabati'], coordinates: [[86.80, 22.60], [87.20, 22.60], [87.20, 22.30], [86.80, 22.30]] },
  { slug: 'kalimpong', name: 'Kalimpong', namebn: 'কালিম্পং', lat: 27.06, lng: 88.47, population: 500000, area: 1056, headquarters: 'Kalimpong', headquartersbn: 'কালিম্পং', rivers: ['Rangit', 'Teesta'], coordinates: [[88.30, 27.20], [88.60, 27.20], [88.60, 26.90], [88.30, 26.90]] },
  { slug: 'kolkata', name: 'Kolkata', namebn: 'কোলকাতা', lat: 22.57, lng: 88.36, population: 4500000, area: 185, headquarters: 'Kolkata', headquartersbn: 'কোলকাতা', rivers: ['Hooghly'], coordinates: [[88.20, 22.70], [88.50, 22.70], [88.50, 22.45], [88.20, 22.45]] },
  { slug: 'malda', name: 'Malda', namebn: 'মালদা', lat: 25.01, lng: 88.14, population: 4070000, area: 3733, headquarters: 'English Bazar', headquartersbn: 'ইংলিশ বাজার', rivers: ['Ganga', 'Mahananda'], coordinates: [[87.90, 25.20], [88.40, 25.20], [88.40, 24.80], [87.90, 24.80]] },
  { slug: 'murshidabad', name: 'Murshidabad', namebn: 'মুর্শিদাবাদ', lat: 24.18, lng: 88.27, population: 7140000, area: 5324, headquarters: 'Baharampur', headquartersbn: 'বহরামপুর', rivers: ['Bhagirathi', 'Mahananda'], coordinates: [[88.00, 24.40], [88.60, 24.40], [88.60, 23.90], [88.00, 23.90]] },
  { slug: 'nadia', name: 'Nadia', namebn: 'নদিয়া', lat: 23.40, lng: 88.52, population: 5300000, area: 3927, headquarters: 'Krishnanagar', headquartersbn: 'কৃষ্ণনগর', rivers: ['Jalangi', 'Bhagirathi'], coordinates: [[88.30, 23.60], [88.80, 23.60], [88.80, 23.20], [88.30, 23.20]] },
  { slug: 'north-24-parganas', name: 'North 24 Parganas', namebn: 'উত্তর ২৪ পরগনা', lat: 22.81, lng: 88.54, population: 10080000, area: 4094, headquarters: 'Baranagar', headquartersbn: 'বরানগর', rivers: ['Hooghly', 'Bidyadhari'], coordinates: [[88.30, 23.10], [88.90, 23.10], [88.90, 22.60], [88.30, 22.60]] },
  { slug: 'paschim-medinipur', name: 'Paschim Medinipur', namebn: 'পশ্চিম মেদিনীপুর', lat: 22.42, lng: 87.32, population: 5940000, area: 9345, headquarters: 'Midnapore', headquartersbn: 'মেদিনীপুর', rivers: ['Subarnarekha', 'Kangsabati'], coordinates: [[86.90, 22.70], [87.80, 22.70], [87.80, 22.10], [86.90, 22.10]] },
  { slug: 'purba-medinipur', name: 'Purba Medinipur', namebn: 'পূর্ব মেদিনীপুর', lat: 22.20, lng: 87.32, population: 5100000, area: 4736, headquarters: 'Tamluk', headquartersbn: 'তমলুক', rivers: ['Rupnarayan', 'Haldi'], coordinates: [[87.00, 22.50], [87.60, 22.50], [87.60, 21.90], [87.00, 21.90]] },
  { slug: 'purulia', name: 'Purulia', namebn: 'পুরুলিয়া', lat: 23.33, lng: 86.37, population: 2930000, area: 6259, headquarters: 'Purulia', headquartersbn: 'পুরুলিয়া', rivers: ['Damodar', 'Subarnarekha'], coordinates: [[86.10, 23.60], [86.70, 23.60], [86.70, 23.10], [86.10, 23.10]] },
  { slug: 'south-24-parganas', name: 'South 24 Parganas', namebn: 'দক্ষিণ ২৪ পরগনা', lat: 22.17, lng: 88.59, population: 8160000, area: 9960, headquarters: 'Alipore', headquartersbn: 'আলিপুর', rivers: ['Hooghly', 'Matla', 'Sundarbans'], coordinates: [[88.00, 22.60], [89.00, 22.60], [89.00, 21.50], [88.00, 21.50]] },
  { slug: 'siliguri', name: 'Darjeeling (Siliguri)', namebn: 'দার্জিলিং (শিলিগুড়ি)', lat: 26.72, lng: 88.43, population: 3100000, area: 2649, headquarters: 'Siliguri', headquartersbn: 'শিলিগুড়ি', rivers: ['Teesta', 'Mahalananda'], coordinates: [[88.20, 26.90], [88.70, 26.90], [88.70, 26.50], [88.20, 26.50]] },
  { slug: 'uttar-dinajpur', name: 'Uttar Dinajpur', namebn: 'উত্তর দিনাজপুর', lat: 25.62, lng: 88.12, population: 3000000, area: 3140, headquarters: 'Raiganj', headquartersbn: 'রায়গঞ্জ', rivers: ['Mahananda', 'Atreyee'], coordinates: [[87.90, 25.80], [88.40, 25.80], [88.40, 25.40], [87.90, 25.40]] },
];

export function getDistrictBySlug(slug: string): District | undefined {
  return districts.find(d => d.slug.trim() === slug.trim());
}

export function findNearestDistrict(lat: number, lng: number): District {
  let minDist = Infinity;
  let nearest = districts[0];
  for (const d of districts) {
    const dist = Math.sqrt(Math.pow(d.lat - lat, 2) + Math.pow(d.lng - lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }
  return nearest;
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
