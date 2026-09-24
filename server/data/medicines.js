const medicines = [
    {
        name: 'Paracetamol 500mg',
        brand: 'Crocin',
        category: 'Pain Relief',
        description: 'Used for pain relief and fever.',
        composition: 'Paracetamol 500mg',
        strength: '500mg',
        dosageForm: 'Tablet',
        packSize: '15 Tablets',
        mrp: 30,
        sellingPrice: 25,
        stock: 100,
        sku: 'MED-001',
        prescriptionRequired: false,
        isActive: true
    },
    {
        name: 'Amoxicillin 500mg',
        brand: 'Mox',
        category: 'Antibiotics',
        description: 'Antibiotic used to treat a number of bacterial infections.',
        composition: 'Amoxicillin 500mg',
        strength: '500mg',
        dosageForm: 'Capsule',
        packSize: '10 Capsules',
        mrp: 120,
        sellingPrice: 100,
        stock: 50,
        sku: 'MED-002',
        prescriptionRequired: true,
        isActive: true
    },
    {
        name: 'Cetirizine 10mg',
        brand: 'Zyrtec',
        category: 'Allergy',
        description: 'Antihistamine used to relieve allergy symptoms.',
        composition: 'Cetirizine 10mg',
        strength: '10mg',
        dosageForm: 'Tablet',
        packSize: '10 Tablets',
        mrp: 40,
        sellingPrice: 35,
        stock: 200,
        sku: 'MED-003',
        prescriptionRequired: false,
        isActive: true
    }
];
module.exports = medicines;
