import { hash, compare } from "bcrypt";

const getHashedPassword = async (password) => {
    return await hash(password, 3);
}
const comparePasswords = async (password, dbPassword) => {
    return await compare(password, dbPassword);
}

export { getHashedPassword, comparePasswords };