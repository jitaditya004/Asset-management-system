const vendorModel = require("../models/vendorModel");


exports.create = async (req, res, next) => {
  try {
    const { vendor_name } = req.body;
    if (!vendor_name || !vendor_name.trim()) {
      return res.status(400).json({ error: "Vendor name required" });
    }

    const vendor = await vendorModel.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (err) {
    next(err);
  }
};


exports.list = async (req, res, next) => {
  try {
    const vendors = await vendorModel.listVendors();
    res.json(vendors);
  } catch (err) {
    next(err);
  }
};


exports.update = async (req, res, next) => {
  try {
    const vendor_id = req.params.id;
    const updated = await vendorModel.updateVendor(vendor_id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const vendor_id = req.params.id;
    const result = await vendorModel.deleteVendor(vendor_id);

    if (!result) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    if (result.message) {
      return res.status(409).json({ error: result.message });
    }

    res.json({ message: "Vendor deleted", vendor: result });
  } catch (err) {
    next(err);
  }
};
