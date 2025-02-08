
// const express = require('express');
// const Product = require('../models/product');
// const router = express.Router();


// //create a product
// router.post('/product', async (req, res) => {
//     try {
//         const { name, price, category, description,imageurl,quantity,seller } = req.body;
//         const existingProduct = await Product.findOne({ name });

//         if (existingProduct) {
//             return res.status(400).json({ message: 'Product already exists' });
//         }
//         const product = new Product({
//             name,
//             price,
//             category,
//             description,
//             imageurl,
//             quantity,
//             seller
//             });
//         await product.save();
//         res.json(product);
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating product', error });
//     }
// }
// );














// module.exports = router;