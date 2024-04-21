const router = require("express").Router();
const {
   createAccount,
   loginUser,
   forgotPassword,
   verifyResetToken,
   resetPassword,
   refreshToken,
   googleLogin,
} = require("../controllers/auth.controller");

const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/signup", createAccount);

router.post("/login", loginUser);

router.post("/login-admin", loginUser, verifyAdmin);

router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);

router.post("/check-token", verifyResetToken);

router.post("/reset-password", resetPassword);

router.post("/refresh-token", refreshToken);

module.exports = router;

