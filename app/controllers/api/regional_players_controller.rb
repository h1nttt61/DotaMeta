module Api
  class RegionalPlayersController < ApplicationController
    def show
      player = RegionalPlayer.find_by!(player_key: params[:player_key])

      render json: {
        player: {
          player_key: player.player_key,
          nickname: player.nickname,
          region: player.region,
          rank: player.current_rank,
          country: player.country,
          team_id: player.team_id,
          team_tag: player.team_tag,
          last_seen_at: player.last_seen_at
        }
      }
    rescue ActiveRecord::RecordNotFound
      render json: {
        error: "Игрок не найден"
      }, status: :not_found
    end
  end
end