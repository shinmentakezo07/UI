package middleware

import (
	"encoding/json"
	"net/http"

	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/pkg/response"
)

type Validator interface {
	Validate() *domain.AppError
}

// ValidateBody decodes reqBody into a Validator and runs Validate(). On failure it writes a 400 and aborts.
func ValidateBody(next http.HandlerFunc, reqBody Validator) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(reqBody); err != nil {
			response.JSON(w, http.StatusBadRequest, response.Body{Success: false, Error: "Invalid JSON body"})
			return
		}
		if vErr := reqBody.Validate(); vErr != nil {
			response.JSON(w, vErr.Status, response.Body{Success: false, Error: vErr.Message})
			return
		}
		next(w, r)
	}
}
