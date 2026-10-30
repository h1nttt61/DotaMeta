module Api
  class RegionalLeaderboardsController < ApplicationController
    def index
      region = params[:region].presence || "europe"

      players = RegionalLeaderboardService.call(region)

      render json: {
        region: region,
        players: players,
        updated: true
      }
    rescue ArgumentError => e
      render json: {
        error: e.message
      }, status: :bad_request
    rescue StandardError => e
      Rails.logger.error("Regional leaderboard error: #{e.class}: #{e.message}")

      render json: {
        error: "Не удалось загрузить региональный рейтинг"
      }, status: :service_unavailable
    end
  end
end