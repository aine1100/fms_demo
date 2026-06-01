import { db } from '../db/connection';
import { eq, or, ilike, and, count } from 'drizzle-orm';
import { users, companies } from '../db/schema';
import { saveRefreshToken as saveRefreshTokenRedis, findRefreshToken as findRefreshTokenRedis, revokeRefreshToken as revokeRefreshTokenRedis } from '@fms/shared';
import bcrypt from 'bcryptjs';

export const saveRefreshToken = async (userId: number, token: string, expiresInDays: number = 7) => {
  return await saveRefreshTokenRedis(userId, token, expiresInDays);
};

export const findRefreshToken = async (token: string) => {
  return await findRefreshTokenRedis(token);
};

export const revokeRefreshToken = async (token: string) => {
  await revokeRefreshTokenRedis(token);
};

export const createUser = async (userData: any, companyData?: any) => {
  return await db.transaction(async (tx) => {
    let companyId = null;

    if (companyData && companyData.name) {
      const [newCompany] = await tx.insert(companies).values({
        name: companyData.name,
        email: companyData.email || userData.email,
        phone: companyData.phone,
        address: companyData.address,
      }).returning();
      companyId = newCompany.id;
    } else if (userData.companyId) {
      companyId = userData.companyId;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [newUser] = await tx.insert(users).values({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      companyId,
    }).returning();

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  });
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const findUserById = async (id: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getProfileWithCompany = async (userId: number) => {
  const user = await findUserById(userId);
  if (!user) return null;
  
  if (user.companyId) {
    const [company] = await db.select().from(companies).where(eq(companies.id, user.companyId));
    return { ...user, company };
  }
  return user;
};

export const updateUser = async (userId: number, data: any) => {
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }
  
  const [updatedUser] = await db.update(users)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
    
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const getAllUsers = async (limit: number, offset: number, companyId?: number) => {
  const query = companyId ? eq(users.companyId, companyId) : undefined;
  
  const [items, [{ total }]] = await Promise.all([
    db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      companyId: users.companyId,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users).where(query).limit(limit).offset(offset),
    db.select({ total: count() }).from(users).where(query)
  ]);
  
  return { items, total };
};

export const getAllCompanies = async (limit: number, offset: number) => {
  const [items, [{ total }]] = await Promise.all([
    db.select().from(companies).limit(limit).offset(offset),
    db.select({ total: count() }).from(companies)
  ]);
  return { items, total };
};

export const updateCompanyStatus = async (companyId: number, isActive: boolean) => {
  const [updated] = await db.update(companies)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(companies.id, companyId))
    .returning();
  return updated;
};
