const {
    createWishlistDb, 
    getWishlistDb, 
    addItemToWishlistDb, 
    deleteItemFromWishlistDb, 
    addWishlistItemToCartDb,
} = require("../db/wishlist.db");

const {ErrorHandler} = require("../helpers/error");

class wishlistService {

    createWishlist = async (userid) => {
       try {
          return await createWishlistDb(userid); 
       } catch (error) {
          throw new ErrorHandler(error.statusCode, error.message);
       }
    };

    getWishlist = async (wishlist_id) => {
        try {
            return await getWishlistDb(wishlist_id);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    addItemToWishlist = async (data) => {
        try {
            return await addItemToWishlistDb(data);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    deleteItemFromWishlist = async (data) => {
        try {
            return await deleteItemFromWishlistDb(data);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    addWishlistItemToCart = async (data) => {
        try {
            return await addWishlistItemToCartDb(data);
        } catch (error) {
            throw new ErrorHandler(error.statusCode, error.message);
        }
    };

    
}

module.exports = new wishlistService();