var sidebar_template={};
sidebar_template.recentPost={'html':'\
<div class="sidebar_recent_post"> \
<% _.each(recentPosts, function(name) { %> <li><%= name %></li> <% }); %> \
</div> \
'};
sidebar_template.twitter={'html':'\
<div class="sidebar_twitter"></div> \
'};