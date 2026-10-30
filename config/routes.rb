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

    get "leaderboard", to: "leaderboard#index"
    post "leaderboard/refresh", to: "leaderboard#refresh"
    post "leaderboard/broadcast", to: "leaderboard#broadcast"
    get "players/:account_id", to: "players#show"
    get "teams", to: "teams#index"
    get "teams/:id", to: "team_profiles#show"
    get "regional-leaderboard", to: "regional_leaderboards#index"
    get "regional-players/:player_key", to: "regional_players#show"
    resources :favorites, only: [:index, :create, :destroy]
  end

end