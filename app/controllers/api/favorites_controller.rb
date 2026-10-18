class Api::FavoritesController < Api::BaseController
  before_action :authenticate_user!, except: [:index] 

  def index
    if current_user
      favorites = current_user.user_favorites.pluck(:hero_id)
      render json: { favorite_hero_ids: favorites }
    else
      render json: { favorite_hero_ids: [] }
    end
  end

  def create
    return render(json: { error: "Требуется авторизация" }, status: :unauthorized) unless current_user

    favorite = current_user.user_favorites.find_or_initialize_by(hero_id: params[:hero_id])

    if favorite.save
      render json: { success: true, hero_id: favorite.hero_id }, status: :created
    else
      render json: { errors: favorite.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    return render(json: { error: "Требуется авторизация" }, status: :unauthorized) unless current_user

    favorite = current_user.user_favorites.find_by(hero_id: params[:id])

    if favorite&.destroy
      render json: { success: true, hero_id: params[:id].to_i }
    else
      render json: { error: "Герой не найден в избранном" }, status: :not_found
    end
  end
end