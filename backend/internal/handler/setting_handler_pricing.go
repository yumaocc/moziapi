package handler

import (
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/response"

	"github.com/gin-gonic/gin"
)

const publicPricingTokensPerUnit = 1_000_000

var publicPricingModels = []struct {
	ID          string
	DisplayName string
	Provider    string
	Context     string
}{
	{ID: "gpt-5.6-sol", DisplayName: "GPT-5.6 Sol", Provider: "OpenAI", Context: "1M"},
	{ID: "gpt-5.6-terra", DisplayName: "GPT-5.6 Terra", Provider: "OpenAI", Context: "1M"},
	{ID: "gpt-5.6-luna", DisplayName: "GPT-5.6 Luna", Provider: "OpenAI", Context: "1M"},
	{ID: "gpt-5.5", DisplayName: "GPT-5.5", Provider: "OpenAI", Context: "1M"},
	{ID: "gpt-5.4", DisplayName: "GPT-5.4", Provider: "OpenAI", Context: "1M"},
}

type publicModelPrice struct {
	ID                    string  `json:"id"`
	DisplayName           string  `json:"display_name"`
	Provider              string  `json:"provider"`
	Context               string  `json:"context"`
	InputPerMillion       float64 `json:"input_per_million"`
	OutputPerMillion      float64 `json:"output_per_million"`
	CachedInputPerMillion float64 `json:"cached_input_per_million"`
}

type publicModelPricingResponse struct {
	Currency      string             `json:"currency"`
	TokensPerUnit int                `json:"tokens_per_unit"`
	Source        string             `json:"source"`
	UpdatedAt     *time.Time         `json:"updated_at,omitempty"`
	Models        []publicModelPrice `json:"models"`
}

// GetPublicModelPricing exposes the existing dynamically synchronized pricing
// catalog to the anonymous marketing homepage.
// GET /api/v1/settings/model-pricing
func (h *SettingHandler) GetPublicModelPricing(c *gin.Context) {
	if h.pricingService == nil {
		response.InternalError(c, "pricing service is not configured")
		return
	}

	models := make([]publicModelPrice, 0, len(publicPricingModels))
	for _, model := range publicPricingModels {
		pricing := h.pricingService.GetModelPricing(model.ID)
		if pricing == nil || pricing.TokenPricingAbsent {
			continue
		}
		models = append(models, publicModelPrice{
			ID:                    model.ID,
			DisplayName:           model.DisplayName,
			Provider:              model.Provider,
			Context:               model.Context,
			InputPerMillion:       pricing.InputCostPerToken * publicPricingTokensPerUnit,
			OutputPerMillion:      pricing.OutputCostPerToken * publicPricingTokensPerUnit,
			CachedInputPerMillion: pricing.CacheReadInputTokenCost * publicPricingTokensPerUnit,
		})
	}

	var updatedAt *time.Time
	if status := h.pricingService.GetStatus(); status != nil {
		if value, ok := status["last_updated"].(time.Time); ok && !value.IsZero() {
			updatedAt = &value
		}
	}

	response.Success(c, publicModelPricingResponse{
		Currency:      "USD",
		TokensPerUnit: publicPricingTokensPerUnit,
		Source:        "system_pricing_catalog",
		UpdatedAt:     updatedAt,
		Models:        models,
	})
}
