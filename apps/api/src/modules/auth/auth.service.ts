import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import type { AuthResponse, PublicUser } from "@tense-lab/shared";
import { User } from "./entities/user.entity";

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      xp: user.xp,
      streakDays: user.streakDays,
    };
  }

  private signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.users.save(this.users.create({ email, passwordHash, name }));

    return { token: this.signToken(user), user: this.toPublicUser(user) };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.users.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return { token: this.signToken(user), user: this.toPublicUser(user) };
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.users.findOneOrFail({ where: { id } });
    return this.toPublicUser(user);
  }
}
