const AWS = require('aws-sdk');
const fs = require('fs');
const { 
    getAllProductsDb,
    getProductByNameDb,
    getProductDb,
    createProductDb, 
    deleteProductDb, 
    updateProductDb,

} = require("../db/product.db");
const { ErrorHandler } = require("../helpers/error");

class productService {
  getAllProducts = async (page) => {
    const limit = 12;
    const offset = (page - 1) * limit;

    try {
      return await getAllProductsDb({ limit, offset });
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  addProduct = async (data) => {
      try {
        return await createProductDb(data);
      } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
      }
  };

//   addProduct = async (data, imageFile) => {
//     try {
//       const imageUrl = await this.uploadImageToS3(imageFile);
//       const productData = { ...data, image_url: imageUrl };
//       return await createProductDb(productData);
//     } catch (error) {
//       throw new ErrorHandler(error.statusCode, error.message);
//     }
//   };

  getProductById = async (id) => {
    try {
      const product = await getProductDb(id);
      if (!product) {
        throw new ErrorHandler(404, "Product not found");
      }
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getProductByName = async (name) => {
    try {
      const product = await getProductByNameDb(name);
      if (!product) {
        throw new ErrorHandler(404, "Product not found");
      }
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  updateProduct = async (data) => {
    try {
      const product = await getProductDb(data.id);
      if (!product) {
        throw new ErrorHandler(404, "Product not found");
      }
      return updateProductDb(data);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  removeProduct = async (id) => {
    try {
      const product = await getProductDb(id);
      if (!product) {
        throw new ErrorHandler(404, "Product not found");
      }
       await deleteProductDb(id);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  uploadImageToS3 = async (imageFile) => {
    const s3 = new AWS.S3();
    const bucketName = process.env.S3_BUCKET_NAME;
    const keyName = `${Date.now()}-${imageFile.originalname}`;
    const imageStream = fs.createReadStream(imageFile.path);

    const params = {
      Bucket: bucketName,
      Key: keyName,
      Body: imageStream,
      ACL: 'public-read',
      ContentType: imageFile.mimetype
    };

    try {
      const response = await s3.upload(params).promise();
      return response.Location;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new productService();
