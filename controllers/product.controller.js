const pool = require("../config");
const productService = require("../services/product.service");

const getAllProducts = async (req, res) => {
    const {page = 1} = req.query;

    const products = await productService.getAllProducts(page);
    res.json(products);
};

const createProduct = async (req, res) => {
    const newProduct = await productService.addProduct(req.body);
    res.status(200).json(newProduct);
};

const getProductById = async (req, res) => {
    // const id = req.params.id;
    const product = await productService.getProductById(req.params);
    res.status(200).json(product);
};

const getProductByName = async (req, res) => {
    const name = req.params.name;
    const product = await productService.getProductByName(name);
    res.status(200).json(product);
};

// get Product by category name 

const getProductsByCategory = async (req, res) => {
    const categoryName = req.params.categoryName;
    const product = await productService.getProductsByCategory(categoryName);
    res.status(200).json(product);
};
// get Product bt material_type name 

const getProductsByMaterialType = async (req, res) => {
    const MaterialName = req.params.MaterialName;
    const product = await productService.getProductsByMaterialType(MaterialName);
    res.status(200).json(product);
};

const updateProduct = async (req, res) => {
    const {name, weight, description, image_url, material_type_name, category_name} = req.body;
    const {id} = req.params;

    const updatedProduct = await productService.updateProduct({ 
        name, 
        weight, 
        description, 
        image_url,
        id, 
        category_name,
        material_type_name
    });
    res.status(200).json(updatedProduct);
};

const deleteProduct = async (req, res) => {
    const {id} = req.params;

    const deletedProduct = await productService.removeProduct(id);
    res.status(200).json(deletedProduct);
};



module.exports = {
    getAllProducts, 
    createProduct, 
    getProductById, 
    deleteProduct, 
    updateProduct, 
    getProductByName,
    getProductsByCategory,
    getProductsByMaterialType,
};
