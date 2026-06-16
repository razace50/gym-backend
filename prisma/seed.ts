import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";
import { Role } from "../src/generated/prisma";

async function main() {
  const email = "superadmin@gym.com";
  const password = "SuperAdmin123";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Super admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      fullName: "Super Admin",
      email: "superadmin@gym.com",
      password: hashedPassword,
      phone: "0000000000",
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("Super admin created");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });