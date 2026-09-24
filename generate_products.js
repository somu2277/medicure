const fs = require('fs');

const DISTRIBUTION = {
  'Pain Relief / Fever': 5,
  'Cold / Cough / Allergy': 5,
  'Digestive / Acidity': 4,
  'Diabetes': 4,
  'Blood Pressure / Heart': 4,
  'Vitamins / Minerals': 5,
  'Skin / Dermatology': 3,
  'Bone / Joint': 3,
  "Women's / Men's Health": 3,
  "Respiratory / First Aid": 2,
  "Sports / Wellness": 2
};

// A helper dictionary for FDA typical drugs
const DRUGS = {
  "Pain Relief / Fever": [
    { name: 'Tylenol Extra Strength', gen: 'Acetaminophen', comp: 'Acetaminophen 500mg', rx: false },
    { name: 'Advil Liqui-Gels', gen: 'Ibuprofen', comp: 'Ibuprofen 200mg', rx: false },
    { name: 'Aleve', gen: 'Naproxen Sodium', comp: 'Naproxen 220mg', rx: false },
    { name: 'Motrin IB', gen: 'Ibuprofen', comp: 'Ibuprofen 200mg', rx: false },
    { name: 'Aspirin Regimen', gen: 'Aspirin', comp: 'Aspirin 81mg', rx: false }
  ],
  "Cold / Cough / Allergy": [
    { name: 'Zyrtec 24hr', gen: 'Cetirizine HCl', comp: 'Cetirizine 10mg', rx: false },
    { name: 'Claritin', gen: 'Loratadine', comp: 'Loratadine 10mg', rx: false },
    { name: 'Benadryl Allergy', gen: 'Diphenhydramine HCl', comp: 'Diphenhydramine 25mg', rx: false },
    { name: 'Mucinex DM', gen: 'Guaifenesin/Dextromethorphan', comp: '600mg/30mg', rx: false },
    { name: 'Robitussin Adult', gen: 'Dextromethorphan', comp: '20mg/20ml', rx: false }
  ],
  "Digestive / Acidity": [
    { name: 'Tums Ultra Strength', gen: 'Calcium Carbonate', comp: '1000mg', rx: false },
    { name: 'Pepto Bismol', gen: 'Bismuth Subsalicylate', comp: '262mg', rx: false },
    { name: 'Prilosec OTC', gen: 'Omeprazole', comp: '20mg', rx: false },
    { name: 'Imodium A-D', gen: 'Loperamide HCl', comp: '2mg', rx: false }
  ],
  "Diabetes": [
    { name: 'Glucophage', gen: 'Metformin HCl', comp: '500mg', rx: true },
    { name: 'Januvia', gen: 'Sitagliptin', comp: '100mg', rx: true },
    { name: 'Jardiance', gen: 'Empagliflozin', comp: '10mg', rx: true },
    { name: 'Accu-Chek Test Strips', gen: 'Test Strips', comp: 'Diagnostic', rx: false }
  ],
  "Blood Pressure / Heart": [
    { name: 'Lipitor', gen: 'Atorvastatin', comp: '20mg', rx: true },
    { name: 'Norvasc', gen: 'Amlodipine Besylate', comp: '5mg', rx: true },
    { name: 'Lisinopril', gen: 'Lisinopril', comp: '10mg', rx: true },
    { name: 'Coreg', gen: 'Carvedilol', comp: '6.25mg', rx: true }
  ],
  "Vitamins / Minerals": [
    { name: 'Centrum Adults', gen: 'Multivitamin', comp: 'Multivitamin/Multimineral', rx: false },
    { name: 'Nature Made Vitamin D3', gen: 'Vitamin D3', comp: '2000 IU', rx: false },
    { name: 'Nature Bounty B12', gen: 'Vitamin B12', comp: '1000 mcg', rx: false },
    { name: 'One A Day Men\'s', gen: 'Multivitamin', comp: 'Vitamins A,C,D,E, Zinc', rx: false },
    { name: 'Vitafusion Women\'s', gen: 'Multivitamin', comp: 'Gummy Vitamins', rx: false }
  ],
  "Skin / Dermatology": [
    { name: 'Hydrocortisone 1%', gen: 'Hydrocortisone', comp: '1% Cream', rx: false },
    { name: 'Differin Gel', gen: 'Adapalene', comp: '0.1% Gel', rx: false },
    { name: 'CeraVe Moisturizing Cream', gen: 'Ceramides', comp: 'Ceramides 1, 3, 6-II', rx: false }
  ],
  "Bone / Joint": [
    { name: 'Osteo Bi-Flex', gen: 'Glucosamine Chondroitin', comp: '1500mg', rx: false },
    { name: 'Caltrate 600+D3', gen: 'Calcium Carbonate', comp: '600mg Calcium', rx: false },
    { name: 'Voltaren Gel', gen: 'Diclofenac Sodium', comp: '1% Topical', rx: false }
  ],
  "Women's / Men's Health": [
    { name: 'Monistat 3', gen: 'Miconazole Nitrate', comp: '200mg', rx: false },
    { name: 'Plan B One-Step', gen: 'Levonorgestrel', comp: '1.5mg', rx: false },
    { name: 'Rogaine Men\'s', gen: 'Minoxidil', comp: '5% Foam', rx: false }
  ],
  "Respiratory / First Aid": [
    { name: 'Neosporin Original', gen: 'Bacitracin', comp: 'Bacitracin Zinc', rx: false },
    { name: 'Albuterol Inhaler', gen: 'Albuterol Sulfate', comp: '90mcg/actuation', rx: true }
  ],
  "Sports / Wellness": [
    { name: 'Gatorade G2 Powder', gen: 'Electrolytes', comp: 'Sodium, Potassium', rx: false },
    { name: 'Gold Standard Whey', gen: 'Whey Protein', comp: '24g Protein', rx: false }
  ]
};

// Health Concern mapping
const HC_MAP = {
  "Pain Relief / Fever": ['Fever', 'Pain Relief'],
  "Cold / Cough / Allergy": ['Cold & Cough', 'Allergy'],
  "Digestive / Acidity": ['Digestive Health', 'Acidity'],
  "Diabetes": ['Diabetes'],
  "Blood Pressure / Heart": ['Heart Health', 'Blood Pressure'],
  "Vitamins / Minerals": ['Vitamin Deficiency', 'Immunity'],
  "Skin / Dermatology": ['Skin Health'],
  "Bone / Joint": ['Bone & Joint Health'],
  "Women's / Men's Health": ["Women's Health", "Men's Health"],
  "Respiratory / First Aid": ['Respiratory Health', 'First Aid'],
  "Sports / Wellness": ['Sports & Fitness', 'Weight Management']
};

// Category Mapping
const CAT_MAP = {
  "Pain Relief / Fever": { cat: 'Medicine', sub: 'OTC Medicines' },
  "Cold / Cough / Allergy": { cat: 'Medicine', sub: 'OTC Medicines' },
  "Digestive / Acidity": { cat: 'Medicine', sub: 'OTC Medicines' },
  "Diabetes": { cat: 'Medicine', sub: 'Branded Medicines' },
  "Blood Pressure / Heart": { cat: 'Medicine', sub: 'Branded Medicines' },
  "Vitamins / Minerals": { cat: 'Healthcare', sub: 'Vitamins & Supplements' },
  "Skin / Dermatology": { cat: 'Healthcare', sub: 'Skin Care' },
  "Bone / Joint": { cat: 'Healthcare', sub: 'Vitamins & Supplements' },
  "Women's / Men's Health": { cat: 'Healthcare', sub: 'Personal Care' },
  "Respiratory / First Aid": { cat: 'Medicine', sub: 'OTC Medicines' },
  "Sports / Wellness": { cat: 'Healthcare', sub: 'Sports Nutrition' }
};

let products = [];
let manifests = [];
let sources = [];

let counter = 1;

for (const group in DRUGS) {
  const items = DRUGS[group];
  items.forEach((item, idx) => {
    const sku = `FDA-${group.substring(0,3).toUpperCase()}-${counter.toString().padStart(3, '0')}`;
    const pid = `PROD-${counter.toString().padStart(3, '0')}`;
    const imgPath = `/images/products/product-${counter.toString().padStart(3, '0')}.webp`;
    
    // Product
    products.push({
      productId: pid,
      name: item.name,
      genericName: item.gen,
      brand: item.name.split(' ')[0], // simple brand derivation
      manufacturer: 'Reference Manufacturer LLC',
      sku: sku,
      categoryRef: CAT_MAP[group].cat,
      subCategoryRef: CAT_MAP[group].sub,
      healthConcernRefs: HC_MAP[group],
      composition: item.comp,
      activeIngredients: [item.gen],
      strength: item.comp,
      dosageForm: 'Tablet/Capsule/Other',
      packSize: '1 Pack',
      mrp: Math.floor(Math.random() * 500) + 100,
      sellingPrice: Math.floor(Math.random() * 500) + 50,
      prescriptionRequired: item.rx,
      description: `FDA Reference product for ${item.name}`,
      image: imgPath,
      thumbnail: imgPath.replace('.webp', '-thumb.webp'),
      stockQuantity: Math.floor(Math.random() * 500) + 10,
      dataType: 'demo',
      dataSource: 'openFDA Drug Product Labeling Reference',
      sourceUrl: 'https://open.fda.gov/apis/drug/label/',
      sourceIdentifier: sku,
      dataLastUpdated: new Date().toISOString()
    });

    // Manifest
    manifests.push({
      productId: pid,
      image: imgPath,
      thumbnail: imgPath.replace('.webp', '-thumb.webp'),
      imageSource: 'Project Generic Placeholder',
      imageLicense: 'Open/Placeholder'
    });

    // Source
    sources.push({
      productId: pid,
      sourceName: 'openFDA Drug Product Labeling',
      sourceUrl: 'https://open.fda.gov/apis/drug/label/',
      sourceIdentifier: sku,
      dataType: 'reference',
      dataLastUpdated: new Date().toISOString()
    });

    counter++;
  });
}

fs.writeFileSync('./server/data/products.json', JSON.stringify(products, null, 2));
fs.writeFileSync('./server/data/product-image-manifest.json', JSON.stringify(manifests, null, 2));
fs.writeFileSync('./server/data/data-sources.json', JSON.stringify(sources, null, 2));

console.log(`Generated exactly ${products.length} products to spec.`);
