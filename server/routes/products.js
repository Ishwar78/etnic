import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all active products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let products = Product.find(query);
    
    if (sortBy === 'price-low') {
      products = products.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      products = products.sort({ price: -1 });
    } else if (sortBy === 'latest') {
      products = products.sort({ createdAt: -1 });
    } else if (sortBy === 'rating') {
      products = products.sort({ rating: -1 });
    }
    
    const result = await products.lean();
    
    res.json({
      success: true,
      products: result,
      total: result.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get all products (admin - including inactive)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().lean();
    
    res.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images,
      sizes,
      colors,
      stock,
      rating,
    } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      category,
      image,
      images: images || [image],
      sizes: sizes || [],
      colors: colors || [],
      stock: stock || 0,
      rating: rating || 0,
      isActive: true,
    });

    await product.save();
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images,
      sizes,
      colors,
      stock,
      rating,
      isActive,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        originalPrice,
        category,
        image,
        images,
        sizes,
        colors,
        stock,
        rating,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
