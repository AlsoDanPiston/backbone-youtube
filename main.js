var VideoModel = Backbone.Model.extend({
  defaults: function () {
    return {
      videoId: "",
      videoThumbnamil: "",
      videoTitle: "",
      videoDesc: "",
    };
  },
});

// Videos collection - add API fetch here
var VideosCollection = Backbone.Collection.extend({
  url: "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=cercle&type=video&videoEmbeddable=true&key=AIzaSyCjo4u-wcr_ExFNPxiYlWZP3LLr-ythijE",

  model: VideoModel,

  initialize: function () {
    this.on("add", function (model) {
      model.fetch();
    });
  },
  
  parse: function (response) {
    return response.items.map(function (x) {
      return {
        videoId: x.id.videoId,
        videoThumbnail: x.snippet.thumbnails.default.url,
        videoTitle: x.snippet.title,
        videoDesc: x.snippet.description,
      }
    })
  }
});

var AppModel = Backbone.Model.extend({
  defaults: function () {
    return {
      videos: new VideosCollection};
  }
});

var VideoView = Backbone.View.extend({
  className: 'video',  // to reference later

  template: Handlebars.compile($('#five-display-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));

    return this;
  },
});

var AppView = Backbone.View.extend({
  el: $("body"),

  events: {
    "click .search": "newSearch", 
  },
  
  initialize: function () {
    this.$search = this.$('#search');
    this.listenTo(this.model.get('videos'), 'change', this.renderVideo);

    this.$mainspot = this.$('.five-spot');
    this.listenTo(this.model.get('videos'), 'reset', this.renderVideos);
    
    this.renderVideos;
  },

  newSearch: function () {
    var topic = this.$search.val();

    this.model.get('videos').add({
      topic: topic
    });
  },

  renderVideo: function (model) {
    var videoView = new VideoView({ model: model });

    this.$('.five-display').append(videoView.render().el);
  },

  renderVideos: function () {
    this.model.get('videos').each(function (v) {
      this.renderVideo(v);
    }, this);
  },
});

var appModel = new AppModel();
var appView = new AppView ({ model: appModel });

appModel.get('videos').fetch({ reset: true });

