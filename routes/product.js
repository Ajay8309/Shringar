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

} = require("../controllers/product.controller");

const {
     getProductReviews, 
     createproductReviews, 
     updateProductReview
} = require("../controllers/review.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");
const { route, post } = require("./user");

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

     //get product by category name
 router    
     .route("/Material/:MaterialName")
     .get(getProductsByMaterialType);
     // get product by material type name 

router
     .route("/:id")
     .get(getProductById)
     .put(verifyToken, verifyAdmin, updateProduct)
     .delete(verifyAdmin, verifyToken, deleteProduct);    

router
     .route("/:id/reviews")
     .get(verifyToken,getProductReviews)
     .post(verifyToken, createproductReviews)
     .put(verifyToken, updateProductReview);      


module.exports = router;     