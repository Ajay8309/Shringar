const router = require("express").Router();

const {
    getAllProducts, 
    getProduct, 
    deleteProduct, 
    updateProduct, 
    createProduct, 
    getProductByName, 

} = require("../controllers/product.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router
     .route("/")
     .get(getAllProducts)
     .post(verifyToken, verifyAdmin, createProduct);

router
     .route("/:id")
     .get(getProduct)
     .get(getProductByName)
     .put(verifyToken, verifyAdmin, updateProduct)
     .delete(verifyAdmin, verifyToken, deleteProduct);      

module.exports = router;     