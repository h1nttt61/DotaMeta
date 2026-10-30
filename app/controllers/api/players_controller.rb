module Api
  class PlayersController < ApplicationController
    def show
      account_id = params[:account_id]

      unless account_id.match?(/\A\d+\z/)
        return render json: {
          error: "Некорректный ID игрока"
        }, status: :bad_request
      end

      player = PlayerProfileService.call(account_id)

      render json: player
    rescue StandardError => e
      Rails.logger.error(
        "Player profile error: #{e.class}: #{e.message}"
      )

      render json: {
        error: "Не удалось загрузить профиль игрока",
        details: e.message
      }, status: :service_unavailable
    end
  end
end