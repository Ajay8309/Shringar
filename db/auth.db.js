const pool = require("../config/index");

// hum yaha par asynchronus function use kree hai , saari jagah tumhee isiii types kee functions 
// dikhnee vaalee hai
// asynchronus functions jo hotee hai useee hum tab usee krtee hai jab hamee esaa data fetch krnaa 
// hotaa hai jo asynchronus ho (data jo sequance mai nahi aanee vaala and fetch honee mai time lagtaa hai)
// jaise ki for example database see data fetch krnaa yaa kisi API see data fetch krnaa ..yee saari chize
// asynchronus hai..........hum funvtion ki defination likhnee kee baad await keyword use krtee hai
// which means kii wait for all the data to get fetched ..uskee baad we'll go forward
// jaisee joo niche isValidTokenDb function hai uusme humne kuch parameters paas ree hai jiskaa use krke 
// hum check krenge ki token valid hai yaa nahi and uun parameters ko humne $! $2 $3 see replace kiyaa 
// hai jab tak humara puraa data fetch nahi hogaa query see tab tak vo data const {rows} ke andr nahi 
// jaayega

// async await functions kee and try catch bhi use hotaa hai voo aage kee code mai dekhoge tab ptaa chalega
// mai vaha explain kr drdungaa



// token expire toh nahi huaa hai ...iskee liyee hai yee
// yaha hum saari rows extract kr rhee hai
// rows[0].exists iskaa mtlb hai agr row exist krti hai toh true return krna vrnaa false
// aur joo parameters hum curly braces mai paas kr rhee hai...vo objects kee form mai paas kiyee jaa rhee hai
// itnaa sab smjhnee kee baad baakii nichee kee codes bhi smjh mai aajaane chahiyee

// next user.db.js prr aanaa hai

// baaki saare db kaa bhi code acchee see dekhoo jo nahi smjh aara hai vo google kr chatgpt kro agr fir bhii 
// smjh nahi aata hai toh muzjse puchoo

const isValidTokenDb = async ({token, email, curDate}) => {
     const {rows} = await pool.query(
        `
        SELECT EXISTS (select * from public."resetTokens"
        where token = $1 AND email = $2 AND expiration > $3 AND used = $4)
        `,
        [token , email, curDate, false]
     );
     return rows[0].exists;
};


const createResetTokenDb = async ({email, expireDate, fpSalt}) => {
    await pool.query(
        `
        insert into public."resetTokens" (email, expiration, token) values ($1, $2, $3)
        `,
        [email, expireDate, fpSalt]
    );
    return true;
};

const setTokenStatusDb = async ({email}) => {
    await pool.query(
        `
        update public."resetTokens" set used = $1 where email = $2
        `,
        [true, email]
    );
    return true;
};


const deleteResetTokenDb = async (curDate) => {
    await pool.query(
        `
        delete from public."resetTokens" where expiration <= $1
        `,
        [curDate]
    );
    return true;
}



module.exports = {
    isValidTokenDb,
    createResetTokenDb,
    setTokenStatusDb,
    deleteResetTokenDb,
}





// CREATE TABLE public."resetTokens"
// (
//     id SERIAL NOT NULL,
//     email character varying NOT NULL,
//     token character varying NOT NULL,
//     used boolean DEFAULT false NOT NULL,
//     expiration timestamp without time zone,
//     PRIMARY KEY (id)
// );