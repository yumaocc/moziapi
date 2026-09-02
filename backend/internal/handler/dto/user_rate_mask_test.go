package dto

import (
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/stretchr/testify/require"
)

func TestUserAndAdminGroupMappersKeepActualRates(t *testing.T) {
	group := &service.Group{
		ID:                  10,
		RateMultiplier:      1.75,
		ImageRateMultiplier: 0.6,
		VideoRateMultiplier: 0.7,
		PeakRateMultiplier:  2.5,
	}

	userGroup := GroupFromServiceUser(group)
	require.Equal(t, 1.75, userGroup.RateMultiplier)
	require.Equal(t, 0.6, userGroup.ImageRateMultiplier)
	require.Equal(t, 0.7, userGroup.VideoRateMultiplier)
	require.Equal(t, 2.5, userGroup.PeakRateMultiplier)

	adminGroup := GroupFromServiceAdmin(group)
	require.Equal(t, 1.75, adminGroup.RateMultiplier)
	require.Equal(t, 0.6, adminGroup.ImageRateMultiplier)
	require.Equal(t, 0.7, adminGroup.VideoRateMultiplier)
	require.Equal(t, 2.5, adminGroup.PeakRateMultiplier)
}

func TestAPIKeyUserMapperKeepsActualGroupRates(t *testing.T) {
	group := &service.Group{
		ID:                  10,
		RateMultiplier:      1.75,
		ImageRateMultiplier: 0.6,
		VideoRateMultiplier: 0.7,
		PeakRateMultiplier:  2.5,
	}

	key := APIKeyFromServiceUser(&service.APIKey{Group: group})
	require.Equal(t, 1.75, key.Group.RateMultiplier)
	require.Equal(t, 0.6, key.Group.ImageRateMultiplier)
	require.Equal(t, 0.7, key.Group.VideoRateMultiplier)
	require.Equal(t, 2.5, key.Group.PeakRateMultiplier)
}

func TestSubscriptionUserMapperKeepsActualGroupRates(t *testing.T) {
	group := &service.Group{ID: 10, RateMultiplier: 1.75, PeakRateMultiplier: 2.5}

	subscription := UserSubscriptionFromService(&service.UserSubscription{Group: group})
	require.Equal(t, 1.75, subscription.Group.RateMultiplier)
	require.Equal(t, 2.5, subscription.Group.PeakRateMultiplier)
}
