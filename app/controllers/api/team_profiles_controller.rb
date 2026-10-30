module Api
  class TeamProfilesController < ApplicationController
    def show
      render json: TeamProfileService.call(params[:id])
    rescue ArgumentError
      render json: { error: "Некорректный ID команды" }, status: :bad_request
    rescue StandardError => e
      Rails.logger.error("Team profile error: #{e.class}: #{e.message}")

      render json: {
        error: "Не удалось загрузить профиль команды"
      }, status: :service_unavailable
    end
  end
end