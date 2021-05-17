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
  url: function (topic) {
    console.log(topic);
    if (!topic) {
      return "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=cercle&type=video&videoEmbeddable=true&key=AIzaSyCjo4u-wcr_ExFNPxiYlWZP3LLr-ythijE";
    } else {
      return (
        "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=" +
        topic +
        "cercle&type=video&videoEmbeddable=true&key=AIzaSyCjo4u-wcr_ExFNPxiYlWZP3LLr-ythijE"
      );
    }
  },

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
      videos: new VideosCollection(),
    };
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

var MainVideoView = Backbone.View.extend({
  className: 'mainVideo',

  template: Handlebars.compile($('#main-display-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));

    return this;
  }
})

var AppView = Backbone.View.extend({
  el: $("body"),

  events: {
    "click .search": "newSearch", 
    "click .five-display": "newMain"
  },
  
  initialize: function () {
    this.$search = this.$('#search');
    this.listenTo(this.model.get('videos'), 'change', this.renderVideo);
    this.listenTo(this.model.get("videos"), "change", this.renderMainVideo);

    this.$mainspot = this.$('.five-spot');
    this.listenTo(this.model.get('videos'), 'reset', this.renderVideos);
    this.listenTo(this.model.get("videos"), "reset", this.renderMainVideo);
    
    this.renderVideos;
  },

  newSearch: function () {
    var inputTopic = this.$('.topic').val();

    this.model.set({topic: inputTopic});
    // listen to change of model should notice new url and run render functions
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

  renderMainVideo: function (model, vidNum) {
    if (isNaN(vidNum)) {
      vidNum = 0;
    } 

    var mainVideoView = new MainVideoView({ model: model.at(vidNum) });

    this.$(".main-display").append(mainVideoView.render().el);
  },

  newMain: function (e) {
    // why doesn't this selector retrieve anything?
    newId = $(e.currentTarget).data().id;
    //console.log($(e.currentTarget))

    //newNum = this.model.findWhere({id: newId})
    //this.renderMainVideo(this.model, newNum);
  }
});

var appModel = new AppModel();

var appView = new AppView ({ model: appModel });

appModel.get('videos').fetch({ reset: true });

