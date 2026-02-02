// hash.js
import bcrypt from "bcrypt";

const password = "123";     // password you want to hash
const saltRounds = 10;      // same as $2b$10$

async function generateHash() {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hashed Password:", hash);
}

generateHash();
