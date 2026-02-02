export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  message?: string;
  data: any[];
}