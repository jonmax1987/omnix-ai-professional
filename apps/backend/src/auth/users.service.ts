import { Injectable } from '@nestjs/common';
import { User, UserRole, UpdateProfileDto } from '../common/dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@omnix.ai',
      passwordHash: '$2b$10$9djHvmN6iQW6ch1CFYPT1Ogt7XVctTee.SBAsRyD7PnnC91hAQQra', // password: admin123
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'manager@omnix.ai',
      passwordHash: '$2b$10$F/27b68iP4U2Gjd6zCfIqONMg46dRy/Ip/ChdrF1riY7QBhrUHxwi', // password: manager123
      name: 'Store Manager',
      role: UserRole.MANAGER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email && user.isActive);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id && user.isActive);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return null;
    }

    const user = this.users[userIndex];
    this.users[userIndex] = {
      ...user,
      ...updateProfileDto,
      updatedAt: new Date().toISOString(),
    };

    return this.users[userIndex];
  }

  async updateLastLogin(userId: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].lastLoginAt = new Date().toISOString();
      this.users[userIndex].updatedAt = new Date().toISOString();
    }
  }

  async createUser(email: string, password: string, name: string, role: UserRole = UserRole.ANALYST): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      email,
      passwordHash,
      name,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return newUser;
  }

  toUserProfile(user: User) {
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }
}