package web

import (
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRouteSEOForPath(t *testing.T) {
	settings := siteSEOSettings{
		SiteName:     "Example API",
		SiteSubtitle: "Example subtitle",
	}

	t.Run("indexes_only_public_marketing_routes", func(t *testing.T) {
		home := routeSEOForPath("/", settings)
		require.True(t, home.Indexable)
		assert.Equal(t, "/", home.CanonicalPath)
		assert.Equal(t, "GPT API 中转与 OpenAI 国内直连 - Example API", home.Title)
		assert.Equal(t, "Example subtitle", home.Description)
		assert.Equal(t, homeKeywords, home.Keywords)

		docs := routeSEOForPath("/docs?ignored=true", settings)
		require.True(t, docs.Indexable)
		assert.Equal(t, "/docs", docs.CanonicalPath)
		assert.Equal(t, "GPT 与 OpenAI API 中文接入文档 - Example API", docs.Title)
		assert.Equal(t, docsKeywords, docs.Keywords)
	})

	t.Run("brand_only_subtitle_uses_keyword_rich_home_description", func(t *testing.T) {
		brandOnlySettings := siteSEOSettings{
			SiteName:     "MoziAPI",
			SiteSubtitle: "moziapi",
		}

		home := routeSEOForPath("/", brandOnlySettings)
		assert.Equal(t, homeDescription, home.Description)
	})

	t.Run("keeps_private_and_transactional_routes_out_of_the_index", func(t *testing.T) {
		for _, requestPath := range []string{
			"/login",
			"/dashboard",
			"/admin/users",
			"/auth/callback",
			"/payment/result",
			"/legal/privacy",
			"/custom/help",
		} {
			meta := routeSEOForPath(requestPath, settings)
			assert.True(t, meta.Known, "path=%s", requestPath)
			assert.False(t, meta.Indexable, "path=%s", requestPath)
			assert.Equal(t, noindexRobotsContent, meta.Robots, "path=%s", requestPath)
			assert.Equal(t, http.StatusOK, meta.Status, "path=%s", requestPath)
		}
	})

	t.Run("returns_not_found_metadata_for_unknown_routes", func(t *testing.T) {
		meta := routeSEOForPath("/definitely-not-a-route", settings)
		assert.False(t, meta.Known)
		assert.False(t, meta.Indexable)
		assert.Equal(t, http.StatusNotFound, meta.Status)
		assert.Equal(t, "404 Not Found - Example API", meta.Title)
	})

	t.Run("backend_mode_disables_public_indexing", func(t *testing.T) {
		privateSettings := settings
		privateSettings.BackendModeEnabled = true

		for _, requestPath := range []string{"/", "/docs"} {
			meta := routeSEOForPath(requestPath, privateSettings)
			assert.True(t, meta.Known)
			assert.False(t, meta.Indexable)
			assert.Equal(t, noindexRobotsContent, meta.Robots)
			assert.Empty(t, meta.CanonicalPath)
		}
	})
}

func TestRenderRouteSEO(t *testing.T) {
	baseHTML := []byte(`<!doctype html><html><head><title>Old</title><meta name="description" content="old"></head><body><div id="app"></div></body></html>`)
	settings := siteSEOSettings{
		SiteName: "A&B $API",
		SiteLogo: "/brand.svg",
	}
	meta := routeSEOForPath("/", settings)

	result := string(renderRouteSEO(baseHTML, meta, settings, "https://example.com", "nonce-123"))

	assert.Contains(t, result, "<title>GPT API 中转与 OpenAI 国内直连 - A&amp;B $API</title>")
	assert.Contains(t, result, `name="keywords" content="`+homeKeywords+`"`)
	assert.Contains(t, result, `rel="canonical" href="https://example.com/"`)
	assert.Contains(t, result, `property="og:site_name" content="A&amp;B $API"`)
	assert.Contains(t, result, `property="og:image" content="https://example.com/brand.svg"`)
	assert.Contains(t, result, `type="application/ld+json"`)
	assert.Contains(t, result, `nonce="nonce-123"`)
	assert.Contains(t, result, `"name":"A\u0026B $API"`)
	assert.Contains(t, result, `"inLanguage":"zh-CN"`)
	assert.Equal(t, 1, strings.Count(result, `name="description"`))
}

func TestPublicRequestBaseURL(t *testing.T) {
	request, err := http.NewRequest(http.MethodGet, "http://internal.test/docs?source=test", nil)
	require.NoError(t, err)
	request.Host = "public.example.com"
	request.Header.Set("X-Forwarded-Proto", "HTTPS")

	assert.Equal(t, "https://public.example.com", publicRequestBaseURL(request))
	assert.Equal(t, "https://public.example.com/docs", absolutePublicURL(publicRequestBaseURL(request), "/docs"))
}

func TestRobotsAndSitemap(t *testing.T) {
	robots := string(robotsText("https://example.com", false))
	assert.Contains(t, robots, "Allow: /")
	assert.Contains(t, robots, "Disallow: /admin/")
	assert.Contains(t, robots, "Sitemap: https://example.com/sitemap.xml")

	privateRobots := string(robotsText("https://example.com", true))
	assert.Equal(t, "User-agent: *\nDisallow: /\n", privateRobots)

	sitemap := string(sitemapXML("https://example.com", false))
	assert.Contains(t, sitemap, "<loc>https://example.com/</loc>")
	assert.Contains(t, sitemap, "<loc>https://example.com/docs</loc>")

	privateSitemap := string(sitemapXML("https://example.com", true))
	assert.NotContains(t, privateSitemap, "<loc>")
}
