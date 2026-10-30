
module Api
  class TeamsController < ApplicationController
    def index
      render json: {
        teams: TeamsService.call
      }
    rescue StandardError => e
      Rails.logger.error("Teams error: #{e.class}: #{e.message}")

      render json: {
        error: "Не удалось загрузить рейтинг команд"
      }, status: :service_unavailable
    end
  end
end
