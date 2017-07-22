lapis = require "lapis"

import assert_error, capture_errors_json from require "lapis.application"
import set_csrf from require "helpers.csrf"

import get, post, multi from require "helpers.app"

date = require "date"

class extends lapis.Application
  layout: require "views.layout"

  cookie_attributes: =>
    expires = date(true)\adddays(365)\fmt "${http}"
    attr = "Expires=#{expires}; Path=/; HttpOnly"
    attr

  @before_filter =>
    import Users from require "models"
    set_csrf @

    @current_user = Users\read_session @

    if @current_user
      @current_user\update_last_active!

  "/admin": capture_errors_json =>
    assert_error @current_user and @current_user\is_admin!, "not admin"
    render: "admin.home", layout: "layouts.admin"

  "/test": =>
    "hello world", layout: "test_layout"

  "/(*)": =>

  "/logout.json": post =>
    @flow("login")\do_logout!
    json: { success: true }

  "/login.json": post =>
    @flow("login")\do_login!
    json: @flow("formatter")\session!

  "/register.json": post =>
    @flow("login")\do_register!
    json: @flow("formatter")\session!

  "/hits.json": post =>
    @flow("hits")\register_hits!
    json: { success: true }

  "/stats.json": get =>
    assert_error @current_user, "must be logged in"
    stats = @flow("hits")\get_stats {
      offset: @params.offset
    }

    stats = nil unless next stats

    json: { success: true, :stats }

  "/presets.json": get =>
    assert_error @current_user, "must be logged in"
    @flow("presets")\list_presets!

  "/new-preset.json": post =>
    @flow("presets")\create_preset!

  "/songs.json": multi {
    get: =>
      @flow("songs")\list_songs!

    post: =>
      assert_error @current_user, "must be logged in"
      @flow("songs")\create_song!
  }

  "/songs/:song_id.json": multi {
    get: =>
      @flow("songs")\get_song!

    post: =>
      assert_error @current_user, "must be logged in"
      @flow("songs")\update_song!
  }


