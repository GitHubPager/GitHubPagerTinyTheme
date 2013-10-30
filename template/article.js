var article_template={};
article_template.list={'html':' \
<div class="article"> \
<div class="article_title"><a class="article_title_link" href="#/posts/<%=id%>"><%=title%></a></div> \
<div class="article_content"><%=content%></div> \
<div class="article_comment"></div> \
<div class="article_time"><%=date%></div> \
</div>'};
article_template.single={'html':' \
<div class="article"> \
<div class="article_title"><a class="article_title_link" href="#/posts/<%=id%>"><%=title%></a></div> \
<div class="article_content"><%=content%></div> \
<div class="article_comment"></div> \
<div class="article_time"><%=date%></div> \
</div>'};