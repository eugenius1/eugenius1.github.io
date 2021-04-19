require "jekyll-spark"

module Jekyll
  class InfoAlertBlock < ComponentBlock
    def template(context)
      content = @props["content"]

      render = %Q[
        <div class="alert alert-info" role="alert">
          <i class="fa fa-info-circle" aria-hidden="true"></i>
          #{content}
        </div>
      ]
    end
  end
end

Liquid::Template.register_tag('InfoAlert', Jekyll::InfoAlertBlock)