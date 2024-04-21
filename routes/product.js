const router = require("express").Router();

const {
    getAllProducts, 
    getProductById, 
    deleteProduct, 
    updateProduct, 
    createProduct, 
    getProductByName, 
    getProductsByCategory,
    getProductsByMaterialType,
    filterProducts
} = require("../controllers/product.controller");

const {
     getProductReviews, 
     createproductReviews, 
     updateProductReview
} = require("../controllers/review.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router
    .route("/")
    .get(getAllProducts)  
    .post(verifyToken, verifyAdmin, createProduct);

router
    .route("/filter")
    .get(filterProducts);

router
    .route("/category/:categoryName")
    .get(getProductsByCategory);

router
    .route("/Material/:MaterialName")
    .get(getProductsByMaterialType);

router
    .route("/:id/reviews")
    .get(verifyToken, getProductReviews)
    .post(verifyToken, createproductReviews)
    .put(verifyToken, updateProductReview);

router
    .route("/name/:name")
    .get(getProductByName);

router
    .route("/:id")
    .get(getProductById)
    .put(verifyToken, verifyAdmin, updateProduct)
    .delete(verifyToken, verifyAdmin, deleteProduct);


module.exports = router;
