export interface AdminReceiptItem {
  id: number
  receipt_id: number
  name: string
  catalog_code: string
  amount: number
  price: number
  total_cost: number
  category_id?: number | null
  transaction_id?: number | null
  created_at: string
}

export interface AdminReceiptDetail {
  id: number
  user_id: number
  user_email: string
  user_full_name: string
  user_avatar?: string | null
  receipt_id: string
  fiscal_sign: string
  terminal_id: string
  merchant_name: string
  merchant_tin: string
  total_sum: number
  payment_type: string
  receipt_date?: string | null
  created_at: string
  item_count: number
  items?: AdminReceiptItem[]
}

export interface AdminReceiptsResponse {
  receipts: AdminReceiptDetail[]
  total: number
  limit: number
  offset: number
}
