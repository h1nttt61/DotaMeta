class SteamAuthController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :callback
  before_action :authenticate_user!

  def callback
    auth = request.env["omniauth.auth"]

    steam_id = extract_steam_id(auth)

    if steam_id.blank?
      redirect_to "http://localhost:5173/?steam_error=missing_id"
      return
    end

    if User.where.not(id: current_user.id).exists?(steam_id: steam_id)
      redirect_to "http://localhost:5173/?steam_error=already_connected"
      return
    end

    current_user.update!(steam_id: steam_id)

    redirect_to "http://localhost:5173/?steam_connected=true"
  end

  def failure
    redirect_to "http://localhost:5173/?steam_error=auth_failed"
  end

  private

  def extract_steam_id(auth)
    claimed_id = auth.dig("uid") || auth.dig("extra", "claimed_id")

    claimed_id.to_s.split("/").last
  end
end