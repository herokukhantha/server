import bcrypt from "bcryptjs";

const users = [
    {
        name : "Admin",
        email:"Admin@example.com",
        password: bcrypt.hashSync("123456",10),
        isAdmin: true
    },
    {
        name : "user",
        email:"user@example.com",
        password:bcrypt.hashSync("123456",10),
        isAdmin: false
    }
  ];
  
  export default users;
  