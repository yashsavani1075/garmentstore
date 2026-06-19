const ProductConfig = require("../models/ProductConfig");

exports.getConfig = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const config = await ProductConfig.findOne();

    if (!config) {
      return res.status(404).json({
        message: "Config not found",
      });
    }

    config.categories.push({
      name,
      subCategories: [],
    });

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();

    config.categories = config.categories.filter(
      (c) => c.name !== req.params.name,
    );

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const { categoryName, subCategory } = req.body;

    const config = await ProductConfig.findOne();

    const category = config.categories.find((c) => c.name === categoryName);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    category.subCategories.push(subCategory);

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { categoryName, subCategory } = req.body;

    const config = await ProductConfig.findOne();

    const category = config.categories.find((c) => c.name === categoryName);

    category.subCategories = category.subCategories.filter(
      (s) => s !== subCategory,
    );

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFabric = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();

    config.fabrics.push(req.body.fabric);

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFabric = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();

    config.fabrics = config.fabrics.filter((f) => f !== req.params.fabric);

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSize = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();

    config.sizes.push(req.body.size);

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const config = await ProductConfig.findOne();

    config.sizes = config.sizes.filter((s) => s !== req.params.size);

    await config.save();

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
