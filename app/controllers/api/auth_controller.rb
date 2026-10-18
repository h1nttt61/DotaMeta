class Api::AuthController < Api::BaseController
  skip_before_action :verify_authenticity_token, only: [:update_profile]
  def status
    if current_user
      render json: {
        authenticated: true,
        user: user_data(current_user)
      }
    else
      render json: {
        authenticated: false,
        user: nil
      }
    end
  end

  def register
    user = User.new(
      email: params[:email],
      username: params[:username],
      password: params[:password],
      password_confirmation: params[:password_confirmation]
    )

    if user.save
      sign_in(:user, user)
      render json: { authenticated: true, user: user_data(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.valid_password?(params[:password])
      sign_in(:user, user)

      render json: {
        authenticated: true,
        user: user_data(user)
      }
    else
      render json: {
        errors: ["Неверный email или пароль."]
      }, status: :unauthorized
    end
  end

  def logout
    sign_out(:user)

    render json: {
      authenticated: false,
      user: nil
    }
  end

  def update_profile
    if current_user.update(username: params[:username])
      render json: {
        authenticated: true,
        user: user_data(current_user)
      }
    else
      render json: {
        errors: current_user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end


  private

  def user_data(user)
    {
      id: user.id,
      email: user.email,
      username: user.username,
      steam_id: user.steam_id,
      steam_connected: user.steam_id.present?
    }
  end


end