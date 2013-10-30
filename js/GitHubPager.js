(function(global){
	var ARTICLE_DATA="data/article";
	var ARTICLE_DIR="data/";
	var SETTING_DATA="data/settings";
	var CONTAINER_TAG="Container";
	var HEADER_CONTAINER_TAG="#HeaderContainer";
	var FOOTER_CONTAINER_TAG="#FooterContainer";
	var SIDEBAR_CONTAINER_TAG="#SidebarContainer";
	var ARTICLE_CONTAINER_TAG="#ArticleContainer";
	var ARTICLE_DEFAULT_PER_PAGE=5;
	var ARTICLE_CACHE_SIZE=20;
	var ARTICLE_MAX_ITEM_IN_MEMORY=100;
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
		showHomeArticleList:function()
		{
			
				var htmlArticle="";
				var showedArticleNum=0;
				articleEntryCollection.every(function(model){
					if(model.has("deleted"))
					{
						if(model.get("deleted"))
						{
							return true;//Skip
						}
						else
						{
							htmlArticle+=_.template( article_template.list.html, model.attributes );
							showedArticleNum++;
							if(showedArticleNum>=(article_per_page))
							{
								return false;
							}
							return true;
						}
					}
				});
				this.$el.html(htmlArticle);
			
		},
		showSingleArticle:function()
		{
			
			var model=articleEntryCollection.get(currentPageId);
			if(!model) 
			{
				alert("Failed to ready article");
				return;
			}
			htmlArticle=_.template( article_template.single.html, model.attributes );
			this.$el.html(htmlArticle);
		},
		
		
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
		
		showRecentPost: function(model){
			var attr={};
			attr.recentPosts=[];
			var showedArticleNum=0;
			articleEntryCollection.every(function(model){
					if(model.has("deleted"))
					{
						if(model.get("deleted"))
						{
							return true;//Skip
						}
						showedArticleNum++;
						attr.recentPosts.push(model.get("title"));
						if(showedArticleNum>=(article_per_page))
						{
								return false;
						}
						
						return true;
					}
			});
           var template = _.template( sidebar_template.recentPost.html, attr );
		   this.$el.append(template);
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
	var currentPageId=-1;
	var article_per_page=ARTICLE_DEFAULT_PER_PAGE;
	function loadEntryData(id,length)
	{
		if(articleEntryCollection.length>ARTICLE_MAX_ITEM_IN_MEMORY)
		{
			articleEntryCollection.reset();
		}
		if(!id) id=articleSize;
		if(!length) length=ARTICLE_CACHE_SIZE;
		var i=0;
		var needToLoad=0;
		var hasLoad=0;
		while(id>0&&i<length)
		{
			if(!articleEntryCollection.get(id))
			{
				needToLoad++;
				var model=new ArticleEntryModel();
				model.id=id;
				articleEntryCollection.add(model,{silent: true});
				model.fetch({
					success:function(rmodel)
					{
						
						hasLoad++;
						if(hasLoad==needToLoad) 
							articleEntryCollection.trigger("ready");
					},
					error:function(rmodel){
						hasLoad++;
						if(hasLoad==needToLoad) 
							articleEntryCollection.trigger("ready");
						console.log("unable to load entry:"+rmodel.id);
					}
				});
			}
			id--;
			i++;
		}
		if(needToLoad==0) articleEntryCollection.trigger("ready");
	}
	
	function showHomeArticleList()
	{
			articleView.listenToOnce(articleEntryCollection,"ready",articleView.showHomeArticleList);
			sidebarView.listenToOnce(articleEntryCollection,"ready",sidebarView.showRecentPost);
			//Preload article
			articleCounter.fetch
			({
				success:function(rmodel){
					articleSize=rmodel.get("size");
					loadEntryData();
				},
				error:function(){alert("Loading article counter failed");}
			});
	}
	
	function showSingleArticle(id)
	{
		articleView.listenToOnce(articleEntryCollection,"ready",articleView.showSingleArticle);
		
		currentPageId=id;
		loadEntryData(id,1);
		
	
	}
	
	function set_article_per_page(model)
	{
		article_per_page=model.get("article_per_page");
	}
	
	var GitHubPager={
		init:function(config)
		{
			//Init Var
			headerView=new HeaderView({ el: $(HEADER_CONTAINER_TAG) });
			footerView=new FooterView({ el: $(FOOTER_CONTAINER_TAG) });
			sidebarView=new SidebarView({ el: $(SIDEBAR_CONTAINER_TAG) });
			articleView=new ArticleView({el:$(ARTICLE_CONTAINER_TAG)});
			
			//Bind Event
			headerView.listenToOnce(settings,"change",headerView.render);
			footerView.listenToOnce(settings,"change",footerView.render);
			sidebarView.listenToOnce(settings,"change",sidebarView.render);
			articleView.listenToOnce(settings,"change",set_article_per_page);
			//Preload Settings
			settings.fetch({
				error:function(){alert("Loading settings failed");}
			});
			
			
			
			//Start Router
			var app_router = new AppRouter;
			Backbone.history.start();
		}
	};
	
	//Router Definition
	var AppRouter = Backbone.Router.extend
	({
        routes: {
            "posts/:id": "getPost",
			
            "*actions": "defaultRoute" 
        },
        getPost: function( id ) {
			showSingleArticle(id);
        },
        defaultRoute: function( actions )
		{
           showHomeArticleList();
        }
    });
    // Start Router
    
	global.GitHubPager=GitHubPager;	
})(this);

