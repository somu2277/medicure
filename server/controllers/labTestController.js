const LabTest = require('../models/LabTest');

exports.getAllLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find({});
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getLabTestById = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (test) {
      res.json(test);
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createLabTest = async (req, res) => {
  try {
    const newTest = new LabTest(req.body);
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    res.status(400).json({ message: 'Invalid test data' });
  }
};

exports.updateLabTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (test) {
      res.json(test);
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid test data' });
  }
};

exports.deleteLabTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndDelete(req.params.id);
    if (test) {
      res.json({ message: 'Test removed' });
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
