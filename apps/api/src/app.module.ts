import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { ContentModule } from "./modules/content/content.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";

@Module({
  imports: [
    // apps/api/src -> repo root is 3 levels up; dist mirrors this same depth.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, "../../../.env") }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres" as const,
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? "tenselab",
        password: process.env.DB_PASSWORD ?? "tenselab",
        database: process.env.DB_NAME ?? "tenselab",
        autoLoadEntities: true,
        // Dev-only convenience; production uses migrations (see spec).
        synchronize: true,
      }),
    }),
    AuthModule,
    ContentModule,
    AnalysisModule,
  ],
})
export class AppModule {}
