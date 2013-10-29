(function(global){
	var ARTICLE_DATA="data/article";
	var ARTICLE_DIR="data/";
	var SETTING_DATA="data/settings";
	var CONTAINER_TAG="Container";
	var HEADER_CONTAINER_TAG="#HeaderContainer";
	var FOOTER_CONTAINER_TAG="#FooterContainer";
	var SIDEBAR_CONTAINER_TAG="#SidebarContainer";
	var ARTICLE_CONTAINER_TAG="#ArticleContainer";
	var ARTICLE_MAX_PER_PAGE=5;
	
	//Model Definition
	var ArticleEntryCollection=Backbone.Collection.extend({
		model:ArticleEntryModel,
		url:ARTICLE_DIR
	});
	var SettingsModel=Backbone.Model.extend({
		url:SETTING_DATA
	});
	var ArticleCounterModel=Backbone.Model.extend({
		url:ARTICLE_DATA
	});
	var ArticleEntryModel=Backbone.Model.extend({
	});
	//View Definition
	var ArticleView=Backbone.View.extend({
		updateArticle:function()
		{
			if(showedArticleNum>=(article_per_page||ARTICLE_MAX_PER_PAGE))
			{
				return;
			}
			else
			{
				var htmlArticle="";
				showedArticleNum=0;
				articleEntryCollection.every(function(model){
					if(model.has("deleted"))
					{
						if(model.get("deleted"))
						{
							articleEntryCollection.remove(model);
						}
						else
						{
							htmlArticle+=_.template( article_template.html, model.attributes );
							showedArticleNum++;
							if(showedArticleNum>=(article_per_page||ARTICLE_MAX_PER_PAGE))
							{
								return false;
							}
							return true;
						}
					}
				});
				this.$el.html(htmlArticle);
			}
		},
		showSingleArticle:function(id)
		{
			var model=articleEntryCollection.get(id);
			htmlArticle=_.template( article_template.html, model.attributes );
			this.$el.html(htmlArticle);
		}
		
	});
	var HeaderView=Backbone.View.extend({
		render: function(model){
           var template = _.template( header_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	var FooterView=Backbone.View.extend({
		render: function(model){
           var template = _.template( footer_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	var SidebarView=Backbone.View.extend({
		render: function(model){
           var template = _.template( sidebar_template.html, model.attributes );
		   this.$el.html(template);
        }
	});
	
	var settings=new SettingsModel();
	var articleCounter=new ArticleCounterModel();
	var articleEntryCollection=new ArticleEntryCollection();
	articleEntryCollection.comparator='id';
	var headerView=null;
	var	footerView=null;
	var	sidebarView=null;
	var articleView=null;
	var articleSize=0;
	var	article_per_page=0;
	var articlePointer=-1;
	var showedArticleNum=0;
	function set_article_per_page(model)
	{
		article_per_page=model.get("article_per_page");
	}
	function preloadEntryData(model)
	{
		articleSize=model.get("size");
		articlePointer=articleSize;
		var cache=article_per_page||ARTICLE_MAX_PER_PAGE;
		var i=0;
		while(articlePointer>0&&i<cache)
		{
			var model=new ArticleEntryModel();
			model.id=articlePointer;
			articleEntryCollection.add(model);
			model.fetch({
			error:function(rmodel){articleEntryCollection.remove(rmodel);}
			});
			articlePointer--;
		}	
	}
	
	var GitHubPager={
		init:function(config)
		{
			_.extend(this, Backbone.Events);
			headerView=new HeaderView({ el: $(HEADER_CONTAINER_TAG) });
			footerView=new FooterView({ el: $(FOOTER_CONTAINER_TAG) });
			sidebarView=new SidebarView({ el: $(SIDEBAR_CONTAINER_TAG) });
			articleView=new ArticleView({el:$(ARTICLE_CONTAINER_TAG)});
			this.bindEvent();
			var app_router = new AppRouter;
			Backbone.history.start();
		},
		decorate:function()
		{
			settings.fetch({
			error:function(){alert("Loading settings failed");}
			});
			articleCounter.fetch({
			error:function(){alert("Loading article counter failed");}
			});
		},
		bindEvent:function()
		{
			headerView.listenToOnce(settings,"change",headerView.render);
			footerView.listenToOnce(settings,"change",footerView.render);
			sidebarView.listenToOnce(settings,"change",sidebarView.render);
			articleView.listenTo(articleEntryCollection,"change",articleView.updateArticle);
			this.listenToOnce(settings,"change",set_article_per_page);
			this.listenToOnce(articleCounter,"change",preloadEntryData);
		}
	};
	
	//Router Definition
	var AppRouter = Backbone.Router.extend
	({
        routes: {
            "posts/:id": "getPost",
			"home":"getHome",
            "*actions": "defaultRoute" 
        },
        getPost: function( id ) {
			articleView.showSingleArticle(id);
            
        },
		getHome:function()
		{
			
		},
        defaultRoute: function( actions ){
           
        }
    });
    // Start Router
    
	global.GitHubPager=GitHubPager;	
})(this);

