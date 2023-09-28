
 // password must be >= 6 letters and should be of string type
            // email shuld be not empty and should be of string ty
const validateUser = (email, password) => {
    const validEmail = typeof email === "string" && email.trim() !== "";
    const validPassword = 
     typeof password === "string" && password.trim().length >= 6;

    return validEmail = validPassword; 
};

const validatePassword = (password) => {
    const validPassword = 
    typeof password === "string" && password.trim().length >= 6;
    return validPassword;
}

module.exports = {validatePassword, validateUser};