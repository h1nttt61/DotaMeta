Rails.application.routes.draw do
  root "home#index"

  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users

  match "/auth/steam/callback",
        to: "steam_auth#callback",
        via: [:get, :post]

  get "/auth/failure", to: "steam_auth#failure"

  namespace :api do
    get "heroes", to: "heroes#index"
    get "csrf", to: "csrf#show"

    get "auth/status", to: "auth#status"
    post "auth/register", to: "auth#register"
    post "auth/login", to: "auth#login"
    delete "auth/logout", to: "auth#logout"
    patch "auth/profile", to: "auth#update_profile"

    resources :favorites, only: [:index, :create, :destroy]
  end
end