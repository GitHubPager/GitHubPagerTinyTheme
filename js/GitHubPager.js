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
		showArticleList:function()
		{
				var htmlArticle="";
				this.$el.html("");//Empty;
				var showedArticleNum=0;
				if(pagingPointer<0) pagingPointer=articleSize;
				while(pagingPointer>=0&&pagingPointer<=articleSize&&showedArticleNum<(article_per_page))
				{
					
					var tmodel=articleEntryCollection.get(pagingPointer);
					if(tmodel&&tmodel.has("deleted"))
					{
						if(tmodel.get("deleted"))
						{
							continue;//Skip
						}
						htmlArticle+=_.template( article_template.listItem.html, tmodel.attributes );
						showedArticleNum++;
					}
					if(reverseDirection)
					pagingPointer++;
					else
					pagingPointer--;
				}
				if(pagingPointer>0)
					htmlArticle+=_.template( article_template.next.html,{});
				if(pagingPointer+article_per_page<articleSize)
					htmlArticle+=_.template( article_template.prev.html,{});
				this.$el.append(htmlArticle);
		},
		showSingleArticle:function()
		{
			
			var model=articleEntryCollection.get(currentSinglePageId);
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
			if(isRecentPostsShowed) return false;
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
		   this.$el.prepend(template);
		   isRecentPostsShowed=true;
        }
	});
	
	
	//Some variables
	var settings=new SettingsModel();
	var articleCounter=new ArticleCounterModel();
	var articleEntryCollection=new ArticleEntryCollection();
	articleEntryCollection.comparator='id';
	var headerView=null;
	var	footerView=null;
	var	sidebarView=null;
	var articleView=null;
	//All Post Counter
	var articleSize=0;
	//Single Post Page
	var currentSinglePageId=-1;
	//Paging System
	var pagingPointer=-1;

	var article_per_page=ARTICLE_DEFAULT_PER_PAGE;
	var reverseDirection=false;
	//Sidebar
	var isRecentPostsShowed=false;
	
	
	
	function loadEntryData(id,length)
	{
		if(articleEntryCollection.length>ARTICLE_MAX_ITEM_IN_MEMORY)
		{
			articleEntryCollection.reset();
		}
		if(id<=0) id=articleSize;
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
	
	function loadAndShowArticleList(pointer)
	{
			
			articleView.listenToOnce(articleEntryCollection,"ready",articleView.showArticleList);
			sidebarView.listenToOnce(articleEntryCollection,"ready",sidebarView.showRecentPost);
			if(pointer) pagingPointer=pointer;
			articleCounter.fetch
			({
				success:function(rmodel){
					articleSize=rmodel.get("size");
					loadEntryData(pagingPointer);
				},
				error:function(){alert("Loading article counter failed");}
			});
	}
	
	function loadAndShowSingleArticle(id)
	{
		articleView.listenToOnce(articleEntryCollection,"ready",articleView.showSingleArticle);
		currentSinglePageId=id;
		loadEntryData(id,1);
	}
	
	function set_article_per_page(model)
	{
		article_per_page=model.get("article_per_page");
	}
	
	function setReversePagingDirection(direction)
	{
		reverseDirection=direction;
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
			"nextPage":"nextPage",
			"prevPage":"prevPage",
            "*actions": "defaultRoute" 
        },
        getPost: function( id ) {
			loadAndShowSingleArticle(id);
        },
		nextPage:function(){
			setReversePagingDirection(false);
			loadAndShowArticleList();
		},
		prevPage:function(){
			setReversePagingDirection(true);
			loadAndShowArticleList();
		},
        defaultRoute: function( actions )
		{
           loadAndShowArticleList();
        }
    });
    // Start Router
    
	global.GitHubPager=GitHubPager;	
})(this);

