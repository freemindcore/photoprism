package api

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestGetPhoto(t *testing.T) {
	t.Run("search for existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		GetPhoto(router)
		r := PerformRequest(app, "GET", "/api/v1/photos/pt9jtdre2lvl0yh7")
		assert.Equal(t, http.StatusOK, r.Code)
		val := gjson.Get(r.Body.String(), "Lat")
		assert.Equal(t, "48.519234", val.String())
	})

	t.Run("search for not existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		GetPhoto(router)
		r := PerformRequest(app, "GET", "/api/v1/photos/xxx")
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}

func TestUpdatePhoto(t *testing.T) {
	t.Run("successful request", func(t *testing.T) {
		app, router, _ := NewApiTest()
		UpdatePhoto(router)
		r := PerformRequestWithBody(app, "PUT", "/api/v1/photos/pt9jtdre2lvl0y13", `{"Title": "Updated01", "Country": "de"}`)
		val := gjson.Get(r.Body.String(), "Title")
		assert.Equal(t, "Updated01", val.String())
		val2 := gjson.Get(r.Body.String(), "Country")
		assert.Equal(t, "de", val2.String())
		assert.Equal(t, http.StatusOK, r.Code)
	})

	t.Run("invalid request", func(t *testing.T) {
		app, router, _ := NewApiTest()
		UpdatePhoto(router)
		r := PerformRequestWithBody(app, "PUT", "/api/v1/photos/pt9jtdre2lvl0y13", `{"Name": "Updated01", "Country": 123}`)
		assert.Equal(t, http.StatusBadRequest, r.Code)
	})

	t.Run("not found", func(t *testing.T) {
		app, router, _ := NewApiTest()
		UpdatePhoto(router)
		r := PerformRequestWithBody(app, "PUT", "/api/v1/photos/xxx", `{"Name": "Updated01", "Country": "de"}`)
		val := gjson.Get(r.Body.String(), "error")
		assert.Equal(t, "Photo not found", val.String())
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}

func TestGetPhotoDownload(t *testing.T) {
	t.Run("could not find original", func(t *testing.T) {
		app, router, conf := NewApiTest()
		GetPhotoDownload(router)
		r := PerformRequest(app, "GET", "/api/v1/photos/pt9jtdre2lvl0yh7/dl?t="+conf.DownloadToken())
		assert.Equal(t, http.StatusNotFound, r.Code)
	})

	t.Run("not existing photo", func(t *testing.T) {
		app, router, conf := NewApiTest()
		GetPhotoDownload(router)
		r := PerformRequest(app, "GET", "/api/v1/photos/xxx/dl?t="+conf.DownloadToken())
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}

func TestLikePhoto(t *testing.T) {
	t.Run("existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		LikePhoto(router)
		r := PerformRequest(app, "POST", "/api/v1/photos/pt9jtdre2lvl0yh9/like")
		assert.Equal(t, http.StatusOK, r.Code)
		GetPhoto(router)
		r2 := PerformRequest(app, "GET", "/api/v1/photos/pt9jtdre2lvl0yh9")
		val := gjson.Get(r2.Body.String(), "Favorite")
		assert.Equal(t, "true", val.String())
	})

	t.Run("not existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		LikePhoto(router)
		r := PerformRequest(app, "POST", "/api/v1/photos/xxx/like")
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}

func TestDislikePhoto(t *testing.T) {
	t.Run("existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		DislikePhoto(router)
		r := PerformRequest(app, "DELETE", "/api/v1/photos/pt9jtdre2lvl0yh8/like")
		assert.Equal(t, http.StatusOK, r.Code)
		GetPhoto(router)
		r2 := PerformRequest(app, "GET", "/api/v1/photos/pt9jtdre2lvl0yh8")
		val := gjson.Get(r2.Body.String(), "Favorite")
		assert.Equal(t, "false", val.String())
	})

	t.Run("not existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		DislikePhoto(router)
		r := PerformRequest(app, "DELETE", "/api/v1/photos/xxx/like")
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}

func TestSetPhotoPrimary(t *testing.T) {
	t.Run("existing photo", func(t *testing.T) {
		app, router, _ := NewApiTest()
		PhotoFilePrimary(router)
		r := PerformRequest(app, "POST", "/api/v1/photos/pt9jtdre2lvl0yh8/files/ft1es39w45bnlqdw/primary")
		assert.Equal(t, http.StatusOK, r.Code)
		GetFile(router)
		r2 := PerformRequest(app, "GET", "/api/v1/files/ocad9168fa6acc5c5c2965ddf6ec465ca42fd818")
		val := gjson.Get(r2.Body.String(), "Primary")
		assert.Equal(t, "true", val.String())
		r3 := PerformRequest(app, "GET", "/api/v1/files/3cad9168fa6acc5c5c2965ddf6ec465ca42fd818")
		val2 := gjson.Get(r3.Body.String(), "Primary")
		assert.Equal(t, "false", val2.String())
	})

	t.Run("wrong photo uid", func(t *testing.T) {
		app, router, _ := NewApiTest()
		PhotoFilePrimary(router)
		r := PerformRequest(app, "POST", "/api/v1/photos/xxx/files/ft1es39w45bnlqdw/primary")
		val := gjson.Get(r.Body.String(), "error")
		assert.Equal(t, "Photo not found", val.String())
		assert.Equal(t, http.StatusNotFound, r.Code)
	})
}
