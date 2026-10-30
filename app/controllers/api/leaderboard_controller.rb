
module Api
  class LeaderboardController < ApplicationController
    def index
      players = Rails.cache.read("leaderboard_players") || []

      render json: {
        players: players,
        updated: players.present?
      }
    end

    def refresh
      players = LeaderboardService.refresh

      render json: {
        success: true,
        players: players
      }
    rescue StandardError => e
      Rails.logger.error("Leaderboard refresh failed: #{e.message}")

      render json: {
        success: false,
        error: "Не удалось обновить рейтинг"
      }, status: :service_unavailable
    end
  end
end
