const bcrypt = require("bcrypt");

const hashPassword = async (Password) => {
    const salt = await bcrypt.genSalt();
    const hashedPasssword = await bcrypt.hash(Password, salt);
    return hashedPasssword;
};

const comparePassword = async (Password, passwordHash) => {
    await bcrypt.compare(passwordHash, Password);
}

module.exports = {hashPassword, comparePassword};