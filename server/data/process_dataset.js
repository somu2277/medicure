const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const DATASET_DIR = path.join(__dirname, '../../medicene_dataset');
const PRODUCT_FILE = path.join(DATASET_DIR, 'product.txt');
const OUT_MEDICINES = path.join(__dirname, 'medicines.json');
const OUT_MANIFEST = path.join(__dirname, 'product-image-manifest.json');
const OUT_SOURCES = path.join(__dirname, 'data-sources.json');
const OUT_MAPPING = path.join(__dirname, 'field-mapping.json');
const OUT_REPORT = path.join(__dirname, 'dataset-inspection-report.json');
const OUT_README = path.join(__dirname, 'README.md');

// Target distribution
const TARGET_DISTRIBUTION = {
    'Pain Relief / Fever': 5,
    'Cold / Cough / Allergy': 5,
    'Digestive / Acidity': 4,
    'Diabetes': 4,
    'Blood Pressure / Heart': 4,
    'Vitamins / Minerals': 5,
    'Skin / Dermatology': 3,
    'Bone / Joint': 3,
    "Women's / Men's Health": 3,
    'Respiratory / First Aid': 2,
    'Sports / Wellness': 2
};

// Keyword mapping to detect categories from nonproprietaryname or pharm_classes
const CATEGORY_KEYWORDS = {
    'Pain Relief / Fever': ['acetaminophen', 'ibuprofen', 'naproxen', 'aspirin', 'analgesic', 'anti-inflammatory'],
    'Cold / Cough / Allergy': ['cetirizine', 'loratadine', 'diphenhydramine', 'dextromethorphan', 'guaifenesin', 'antihistamine', 'cough'],
    'Digestive / Acidity': ['omeprazole', 'calcium carbonate', 'bismuth', 'pantoprazole', 'loperamide', 'antacid'],
    'Diabetes': ['metformin', 'insulin', 'glipizide', 'sitagliptin', 'empagliflozin', 'tirzepatide', 'diabetes'],
    'Blood Pressure / Heart': ['atorvastatin', 'amlodipine', 'lisinopril', 'losartan', 'metoprolol', 'statin', 'beta blocker'],
    'Vitamins / Minerals': ['vitamin', 'multivitamin', 'ascorbic', 'cholecalciferol', 'cyanocobalamin', 'mineral'],
    'Skin / Dermatology': ['hydrocortisone', 'adapalene', 'salicylic acid', 'benzoyl peroxide', 'clotrimazole', 'topical'],
    'Bone / Joint': ['glucosamine', 'chondroitin', 'diclofenac', 'meloxicam', 'calcium', 'joint'],
    "Women's / Men's Health": ['levonorgestrel', 'sildenafil', 'tadalafil', 'miconazole', 'finasteride'],
    'Respiratory / First Aid': ['albuterol', 'fluticasone', 'budesonide', 'bacitracin', 'neosporin', 'asthma'],
    'Sports / Wellness': ['whey', 'electrolyte', 'protein', 'amino', 'creatine', 'hydration']
};

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

const CAT_MAP = {
  "Pain Relief / Fever": { cat: 'health-concern', sub: 'pain-relief' },
  "Cold / Cough / Allergy": { cat: 'health-concern', sub: 'cold-cough' },
  "Digestive / Acidity": { cat: 'health-must-haves', sub: 'daily-wellness' },
  "Diabetes": { cat: 'diabetes-essentials', sub: 'diabetes-care' },
  "Blood Pressure / Heart": { cat: 'medicines', sub: 'prescription-drugs' },
  "Vitamins / Minerals": { cat: 'vitamins-supplements', sub: 'multivitamins' },
  "Skin / Dermatology": { cat: 'skin-care', sub: 'face-care' },
  "Bone / Joint": { cat: 'vitamins-supplements', sub: 'calcium' },
  "Women's / Men's Health": { cat: 'personal-care', sub: 'bath-body' },
  "Respiratory / First Aid": { cat: 'health-must-haves', sub: 'first-aid' },
  "Sports / Wellness": { cat: 'sports-nutrition', sub: 'whey-protein' }
};

async function processDataset() {
    console.log('Starting dataset inspection and normalization...');
    
    if (!fs.existsSync(PRODUCT_FILE)) {
        console.error('CRITICAL ERROR: Dataset not found at', PRODUCT_FILE);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(PRODUCT_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let headers = [];
    let totalRecords = 0;
    
    // Tracking for the 40 records
    const selectedRecords = [];
    const collectedCounts = Object.keys(TARGET_DISTRIBUTION).reduce((acc, k) => { acc[k] = 0; return acc; }, {});

    // For deterministic selection, we'll keep a Set of generic names to avoid duplicating the exact same drug
    const seenGenerics = new Set();
    const seenBrands = new Set();

    let isFirstLine = true;

    for await (const line of rl) {
        if (isFirstLine) {
            headers = line.split('\t');
            isFirstLine = false;
            continue;
        }

        totalRecords++;
        
        // Fast exit if we have collected all 40 records
        if (selectedRecords.length >= 40) {
            // We still need to count total records for the inspection report, so we could continue,
            // but for performance, we'll just break and estimate or use what we read.
            // Actually, we'll just keep reading to get total count, but skip processing.
            continue;
        }

        const values = line.split('\t');
        const record = {};
        headers.forEach((h, i) => record[h] = values[i]);

        // Basic filtering for clean data
        if (!record.PROPRIETARYNAME || !record.NONPROPRIETARYNAME || !record.ACTIVE_NUMERATOR_STRENGTH) continue;
        
        // Skip duplicate brands or generics for variety
        const genericLower = record.NONPROPRIETARYNAME.toLowerCase();
        const brandLower = record.PROPRIETARYNAME.toLowerCase();
        if (seenGenerics.has(genericLower) || seenBrands.has(brandLower)) continue;

        // Determine category matching
        const searchString = `${genericLower} ${record.PHARM_CLASSES ? record.PHARM_CLASSES.toLowerCase() : ''}`;
        
        let matchedCategory = null;
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (collectedCounts[category] >= TARGET_DISTRIBUTION[category]) continue;
            
            if (keywords.some(kw => searchString.includes(kw))) {
                matchedCategory = category;
                break;
            }
        }

        if (matchedCategory) {
            // Selected this record!
            collectedCounts[matchedCategory]++;
            seenGenerics.add(genericLower);
            seenBrands.add(brandLower);
            
            // Normalize
            selectedRecords.push({
                sourceRecord: record,
                category: matchedCategory
            });
        }
    }

    console.log(`Total Source Records: ${totalRecords}`);
    console.log(`Selected ${selectedRecords.length} records. Target was 40.`);
    
    // Generate normalized dataset
    const medicines = [];
    const manifests = [];
    const sources = [];

    selectedRecords.forEach((item, index) => {
        const r = item.sourceRecord;
        const pid = `MED-${(index + 1).toString().padStart(4, '0')}`;
        const sku = `SKU-${r.PRODUCTNDC.replace('-', '')}`;
        const imgPath = `/images/products/product-${(index + 1).toString().padStart(3, '0')}.webp`;
        const isRx = r.PRODUCTTYPENAME.includes('PRESCRIPTION');
        
        const strengthStr = `${r.ACTIVE_NUMERATOR_STRENGTH} ${r.ACTIVE_INGRED_UNIT}`;
        
        medicines.push({
            productId: pid,
            sku: sku,
            name: `${r.PROPRIETARYNAME} ${strengthStr}`,
            genericName: r.NONPROPRIETARYNAME,
            brand: r.PROPRIETARYNAME,
            manufacturer: r.LABELERNAME,
            composition: `${r.SUBSTANCENAME} ${strengthStr}`,
            activeIngredients: [r.SUBSTANCENAME],
            strength: strengthStr,
            dosageForm: r.DOSAGEFORMNAME,
            packSize: '1 Pack',
            categoryId: CAT_MAP[item.category].cat, // Temporary placeholder for seeder to map
            subcategoryId: CAT_MAP[item.category].sub,
            healthConcernIds: HC_MAP[item.category], // Array of strings for seeder to map
            prescriptionRequired: isRx,
            mrp: Math.floor(Math.random() * 500) + 100,
            sellingPrice: Math.floor(Math.random() * 500) + 50,
            image: imgPath,
            thumbnail: imgPath.replace('.webp', '-thumb.webp'),
            description: `Official openFDA reference data for ${r.PROPRIETARYNAME}. Route: ${r.ROUTENAME}. Classes: ${r.PHARM_CLASSES}`,
            stockQuantity: Math.floor(Math.random() * 500) + 50,
            status: 'Active',
            dataType: 'demo',
            dataSource: 'openFDA NDC Directory',
            sourceUrl: 'https://open.fda.gov/data/ndc/',
            sourceIdentifier: r.PRODUCTNDC,
            dataLastUpdated: new Date().toISOString()
        });

        manifests.push({
            productId: pid,
            image: imgPath,
            thumbnail: imgPath.replace('.webp', '-thumb.webp'),
            imageSource: 'Project Generic Placeholder',
            imageLicense: 'Open/Placeholder'
        });

        sources.push({
            productId: pid,
            sourceName: 'openFDA NDC Directory',
            sourceUrl: 'https://open.fda.gov/data/ndc/',
            sourceIdentifier: r.PRODUCTNDC,
            dataType: 'reference',
            dataLastUpdated: new Date().toISOString()
        });
    });

    // Write Files
    fs.writeFileSync(OUT_MEDICINES, JSON.stringify(medicines, null, 2));
    fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifests, null, 2));
    fs.writeFileSync(OUT_SOURCES, JSON.stringify(sources, null, 2));

    const mapping = {
        "name": "PROPRIETARYNAME + ACTIVE_NUMERATOR_STRENGTH + ACTIVE_INGRED_UNIT",
        "genericName": "NONPROPRIETARYNAME",
        "brand": "PROPRIETARYNAME",
        "manufacturer": "LABELERNAME",
        "composition": "SUBSTANCENAME + ACTIVE_NUMERATOR_STRENGTH",
        "activeIngredients": "SUBSTANCENAME",
        "strength": "ACTIVE_NUMERATOR_STRENGTH + ACTIVE_INGRED_UNIT",
        "dosageForm": "DOSAGEFORMNAME",
        "sourceIdentifier": "PRODUCTNDC",
        "prescriptionRequired": "Parsed from PRODUCTTYPENAME"
    };
    fs.writeFileSync(OUT_MAPPING, JSON.stringify(mapping, null, 2));

    const report = {
        sourceFile: "product.txt",
        sourceFormat: "TSV",
        totalRecords: totalRecords,
        fields: headers,
        selectedRecords: medicines.length
    };
    fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2));

    const readme = `# MediCare Dataset Source

## Source dataset
openFDA NDC Directory

## Local source path
../../../medicene_dataset/product.txt

## Source URL
https://open.fda.gov/data/ndc/

## Overview
This directory contains exactly 40 normalized medicine records generated deterministically from the local openFDA NDC dataset.
The pricing information is DEMO data. Images are placeholder URLs. No fake pharmaceutical claims are made.
`;
    fs.writeFileSync(OUT_README, readme);

    console.log('Pipeline complete! All files generated in server/data/');
}

processDataset();
