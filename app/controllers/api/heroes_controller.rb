class Api::HeroesController < ApplicationController
  def index
    heroes_res = Net::HTTP.get(URI("https://api.opendota.com/api/heroStats"))
    heroes = JSON.parse(heroes_res)

    patch_name = "7.38"
    begin
      patches_res = Net::HTTP.get(URI("https://api.opendota.com/api/constants/patch"))
      patches = JSON.parse(patches_res)
      if patches.is_a?(Array) && patches.any?
        patch_name = patches.last["name"] || patches.last[:name] || patch_name
      end
    rescue StandardError
    end

    role_param = params[:role]

    if role_param.present? && role_param != "ALL"
      heroes = heroes.select do |hero|
        roles = hero["roles"] || []
        case role_param
        when "Carry"
          roles.include?("Carry") && (hero["pro_pick"].to_i > 10 || hero["pub_pick"].to_i > 5000)
        when "Mid"
          roles.include?("Nuker") || roles.include?("Escape")
        when "Offlane"
          roles.include?("Initiator") || roles.include?("Durable")
        when "SoftSupport"
          roles.include?("Disabler")
        when "HardSupport"
          roles.include?("Support") && !roles.include?("Carry")
        else
          true
        end
      end
    end

    render json: {
      patch: patch_name,
      heroes: heroes
    }
  end
end