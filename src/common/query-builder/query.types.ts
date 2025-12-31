export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FilterMap {
  [key: string]: any;
}

export interface SearchConfig {
  fields: string[];
}
