import { apiClient } from './client'

export interface PublicModelPrice {
  id: string
  display_name: string
  provider: string
  context: string
  input_per_million: number
  output_per_million: number
  cached_input_per_million: number
}

export interface PublicModelPricingResponse {
  currency: 'USD'
  tokens_per_unit: number
  source: string
  updated_at?: string
  models: PublicModelPrice[]
}

export async function getPublicModelPricing(): Promise<PublicModelPricingResponse> {
  const { data } = await apiClient.get<PublicModelPricingResponse>('/settings/model-pricing')
  return data
}
