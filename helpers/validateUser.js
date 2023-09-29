// password must be >= 6 letters and should be of string type
// email should not be empty and should be of string type
const validateUser = (email, password) => {
    const validEmail = typeof email === "string" && email.trim() !== "";
    const validPassword = typeof password === "string" && password.trim().length >= 6;

    return validEmail && validPassword; 
};

module.exports = validateUser;
