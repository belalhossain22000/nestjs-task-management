import { Prisma } from '@prisma/client';
import { getPagination, getPaginationMeta } from '../utils/pagination.util';

interface BuildQueryOptions<TWhere> {
  query: any;
  searchableFields?: string[];
  filterableFields?: string[];
}

export class PrismaQueryBuilder {
  static buildWhere<TWhere extends Record<string, any>>(
    options: BuildQueryOptions<TWhere>,
  ): TWhere {
    const { query, searchableFields = [], filterableFields = [] } = options;

    const where: any = {};

    // 🎯 Exact filters
    for (const field of filterableFields) {
      if (query[field] !== undefined) {
        where[field] = query[field];
      }
    }

    // 🔍 Search
    if (query.search && searchableFields.length) {
      where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: query.search,
          mode: 'insensitive',
        },
      }));
    }

    return where;
  }

  static buildPagination(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      ...getPagination(page, limit),
      metaInput: { page, limit },
    };
  }

  static buildMeta(total: number, metaInput: any) {
    return getPaginationMeta(total, metaInput.page, metaInput.limit);
  }
}
