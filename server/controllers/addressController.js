const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res) => {
    try {
        // Automatically make default if it's the first address
        const count = await Address.countDocuments({ user: req.user._id });
        const isDefault = count === 0 ? true : req.body.isDefault;

        const address = await Address.create({
            ...req.body,
            user: req.user._id,
            isDefault
        });

        res.status(201).json({ success: true, data: address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Ensure user owns address
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // If setting this address to default, let the pre-save hook handle removing other defaults.
        // But pre-save only runs on save(), so we use save().
        Object.assign(address, req.body);
        await address.save();

        res.status(200).json({ success: true, data: address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Ensure user owns address
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await address.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        address.isDefault = true;
        await address.save(); // triggers pre-save hook to unset others

        res.status(200).json({ success: true, data: address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
