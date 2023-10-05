const router = require("express").Router();

const {
    getAllProducts, 
    getProduct, 
    deleteProduct, 
    updateProduct, 
    createProduct, 
    getProductByName, 
    getProductsByCategory

} = require("../controllers/product.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");
const { route } = require("./user");

router
     .route("/")
     .get(getAllProducts)
     .get(getProductsByCategory)
     .post(verifyToken, verifyAdmin, createProduct);


router
     .route("/:name")
     .get(getProductByName);

router
     .route("/category/:categoryName")
     .get(getProductsByCategory);
    

router
     .route("/:id")
     .get(getProduct)
     .put(verifyToken, verifyAdmin, updateProduct)
     .delete(verifyAdmin, verifyToken, deleteProduct);    


module.exports = router;     