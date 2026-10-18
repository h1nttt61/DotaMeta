class Api::CsrfController < Api::BaseController
  def show
    render json: {
      csrf_token: form_authenticity_token
    }
  end
end