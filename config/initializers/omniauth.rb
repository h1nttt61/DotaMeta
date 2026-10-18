OmniAuth.config.request_validation_phase =
  OmniAuth::AuthenticityTokenProtection.new(key: :_csrf_token)

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :open_id,
           name: "steam",
           identifier: "https://steamcommunity.com/openid/"
end