import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      if (params.model === "companies" || params.model === "locations") {
        if (params.action === "delete") {
          params.action = "update";
          params.args["data"] = {
            deleted_at: new Date(Date.now()),
          }
        }
        if (params.action === "findMany") {

          if (params.args?.where) {
            params.args.where.deleted_at = null;
          } else {
            params.args.where = { deleted_at: null };
          }
        }
        return next(params)
      }
    })

  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
