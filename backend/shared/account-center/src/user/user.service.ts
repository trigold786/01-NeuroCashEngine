import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, phone, password, ...otherData } = registerDto;

    // 检查邮箱是否已存在
    const existingByEmail = await this.userRepository.findOne({ where: { email } });
    if (existingByEmail) {
      throw new ConflictException('Email already in use');
    }

    // 检查手机号是否已存在（如果有）
    if (phone) {
      const existingByPhone = await this.userRepository.findOne({ where: { phone } });
      if (existingByPhone) {
        throw new ConflictException('Phone already in use');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建新用户
    const user = this.userRepository.create({
      email,
      phone,
      password: hashedPassword,
      ...otherData,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'email', 'password', 'role', 'accountType'] });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
