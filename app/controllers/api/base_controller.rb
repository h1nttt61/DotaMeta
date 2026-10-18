class Api::BaseController < ApplicationController
  protect_from_forgery with: :exception

  private

  def verified_request?
    super || valid_origin?
  end

  def valid_origin?
    request.origin == "http://localhost:5173"
  end
end